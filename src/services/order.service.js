'use strict'

const mongoose  = require("mongoose")
const { NotFoundError, BadRequestError } = require("../core/error.response")
const { getCartByUserId, getListProductFromCart, updateCartCount, removeFromCart, removeCartShop } = require("../models/repositories/cart.repo")
const { createOrder, getAllOrder, getOneOrderByUser } = require("../models/repositories/order.repo")
const { getShopByShopIds } = require("../models/repositories/shop.repo")
const { checkSkuByServer, checkSkuByServerV2, getSkusByListSkuId, updateSkusStock, getOneSkuById } = require("../models/repositories/sku.repo")
const { getSpusByListSpuId } = require("../models/repositories/spu.repo")
const { getSeclectedProductFromCartService } = require("./cart.service")
const { getDiscountAmountService } = require("./discount.service")
const { aquireLock, releaseLock } = require("./redis.service")
const { getReservationInventoryByOrderId, unReservationInventory } = require("../models/repositories/inventory.repo")
const { producerOrderMessage } = require("../queues/order.producer")
//USER
/*
    {
        cartId,
        user_address: {
            street,
            city,
            state,
            country
        },
        user_payment: {
            method: cash,
            transactionId (auto generate)
        },
        shop_order_ids: [
            {
                shopId,
                shop_discounts: [
                    {
                        shop_id,
                        discount_id,
                        codeId
                    }    
                ],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            }
        ]
    }
*/
const createOrderService = async({
    userId,
    user_address,
    user_payment,
    order_note = '',
    shop_order_ids
}) => {
    const { checkout_order, item_checkout, cart } = await checkoutOrderReviewService({ userId, shop_order_ids})
    //sử dụng để rollback khi 1 sản phẩm bị lỗi
    const validProducts = []
    //orderProductSchema
    const orderProducts = []
    const cartId = cart._id
    const aquireProduct = []
    const orderObjectId = new mongoose.Types.ObjectId()

    for(let i = 0; i < item_checkout.length; i++){
        const shop_order_id = item_checkout[i]

        const orderProduct = {
            shopId: shop_order_id.shop.shopId,
            shop_discount: shop_order_id.shop_discount,
            price_raw: shop_order_id.price_raw,
            price_apply_discount: shop_order_id.price_apply_discount ? shop_order_id.price_apply_discount : 0
        }
        const item_products = []
        for(let i = 0; i < shop_order_id.item_products.length; i++){
            const product = shop_order_id.item_products[i]
            const { productId, quantity } = product
            const keyLock = await aquireLock({ productId, quantity, cartId, orderId: orderObjectId})
            aquireProduct.push(keyLock ? true : false)
            if(keyLock != null){
                const { key, uniqueValue } = keyLock
                validProducts.push({
                    orderId: orderObjectId,
                    productId: product.productId,
                    quantity: product.quantity
                })
                await releaseLock({ keyLock: key, expectedValue: uniqueValue })
            }
            item_products.push({
                productId: product.productId,
                price: product.price,
                quantity: product.quantity,
            })
        }
        orderProduct.item_products = item_products
        orderProducts.push(orderProduct)
    }
    if(aquireProduct.includes(false)){
        //hàm này khi có 3 sản phẩm mà sản phẩm thứ 3 không hợp lệ
        await unReservationInventory({ products: validProducts })
        throw new BadRequestError('Some product have been updated! Pls return to the cart!')
    }
    //checkoutSchema
    const checkout = {
        total_price: checkout_order.totalPrice,
        total_apply_discount: checkout_order.totalDiscount,
        total_checkout: checkout_order.totalCheckout,
        fee_ship: checkout_order.feeShip
    }
    const order = await createOrder({
        _id: orderObjectId,
        userId,
        order_checkout: checkout,
        shipping: user_address,
        payment: user_payment,
        order_products: orderProducts,
        order_note
    })
    if(!order) 
        throw new BadRequestError('Create order failure')

    // sync stock in spu and update discount, cart (message queue)
    await producerOrderMessage({userId, orderProducts: orderProducts})
    return orderProducts
}

const createOrderServiceV2 = async({
    userId,
    user_address,
    user_payment,
    order_note = '',
    shop_order_ids
}) => {
    const { checkout_order, item_checkout, cart } = await checkoutOrderReviewService({ userId, shop_order_ids})
    const validProducts = []
    //orderProductSchema
    const orderProducts = []
    const cartId = cart._id
    const aquireProduct = []
    const orderObjectId = new mongoose.Types.ObjectId()

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        for(let i = 0; i < item_checkout.length; i++){
            const shop_order_id = item_checkout[i]
            const orderProduct = {
                shopId: shop_order_id.shop.shopId,
                shop_discount: shop_order_id.shop_discount,
                price_raw: shop_order_id.price_raw,
                price_apply_discount: shop_order_id.price_apply_discount ? shop_order_id.price_apply_discount : 0
            }
            const item_products = []
            for(let i = 0; i < shop_order_id.item_products.length; i++){
                const product = shop_order_id.item_products[i]
                const { productId, quantity } = product
                const keyLock = await aquireLock({ productId, quantity, cartId, orderId: orderObjectId, session})
                aquireProduct.push(keyLock ? true : false)
                if(keyLock != null){
                    const { key, uniqueValue } = keyLock
                    validProducts.push({
                        orderId: orderObjectId,
                        productId: product.productId,
                        quantity: product.quantity
                    })
                    await releaseLock({ keyLock: key, expectedValue: uniqueValue })
                }
                item_products.push({
                    productId: product.productId,
                    price: product.price,
                    quantity: product.quantity,
                })
            }
            orderProduct.item_products = item_products
            orderProducts.push(orderProduct)
        }
        if(aquireProduct.includes(false)){
            throw new BadRequestError('Some product have been updated! Pls return to the cart!')
            //unReservationInventory và trả lại số lượng tồn kho!!
        }
        //checkoutSchema
        const checkout = {
            total_price: checkout_order.totalPrice,
            total_apply_discount: checkout_order.totalDiscount,
            total_checkout: checkout_order.totalCheckout,
            fee_ship: checkout_order.feeShip
        }
        const order = await createOrder({
            _id: orderObjectId,
            userId,
            order_checkout: checkout,
            shipping: user_address,
            payment: user_payment,
            order_products: orderProducts,
            order_note
        })
        if(!order) 
            throw new BadRequestError('Create order failure')

        await session.commitTransaction()
    } catch (error) {
        await session.abortTransaction()
        return error
    } finally {
        session.endSession()
    }
    return validProducts
}

/*
    {
        cartId,
        shop_order_ids: [
            {
                shopId,
                shop_discounts: {
                    shop_id,
                    discount_id,
                    code
                },
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            }
        ]
    }
*/
const checkoutOrderReviewService = async({
    userId,
    shop_order_ids = []
}) => {
    const foundCart = await getCartByUserId({ userId })
    if(!foundCart)
        throw new NotFoundError('Cart not found')
    const item_checkout = []
    let totalPrice = 0
    let totalDiscount = 0
    let totalCheckout = 0
    let feeShip = 0
    let productIds = [] //sku
    let spuIds = new Set() //spu
    for(let i = 0; i < shop_order_ids.length; i++){
        const shopId = shop_order_ids[i].shopId
        const products = shop_order_ids[i].item_products.map(product => product.productId);
        const selectedProductFromCart = await getSeclectedProductFromCartService({ userId, shopId, products })
        if(shop_order_ids[i].item_products.length !== selectedProductFromCart.products.length)
            throw new BadRequestError('Some product invalid')
        
        const checkProductServer = await checkSkuByServerV2({ listSku: selectedProductFromCart.products})
        //check product valid (price)
        const hasUndefinedProduct = checkProductServer.some( element => element === undefined)
        if(hasUndefinedProduct){
            throw new BadRequestError('Order wrong')
        }
        const discount = shop_order_ids[i].shop_discount
        let discountAmount = 0
        if(discount !== null){
            if(shopId !== discount.shopId)
                throw new BadRequestError('Order wrong')
            discountAmount = await getDiscountAmountService({ userId, shopId: shopId, code: discount.code, products})
        }
        let price_raw = selectedProductFromCart.products.reduce((acc, product) => {
            return acc + product.price * product.quantity
        }, 0)
        const price_apply_discount = price_raw - discountAmount

        //get productIds
        selectedProductFromCart.products.forEach(product => productIds.push(product.productId));

        //itemCheckout
        item_checkout.push({
            shop: selectedProductFromCart.shop,
            shop_discount: discount,
            price_raw,
            price_apply_discount,
            item_products: selectedProductFromCart.products
        })

        totalPrice += selectedProductFromCart.products.reduce((acc, product) => {
            return acc + product.price * product.quantity
        }, 0)   
        totalDiscount += discountAmount
    }
    totalCheckout = totalPrice - totalDiscount
    const checkout_order = {
        totalPrice,
        feeShip,
        totalDiscount,
        totalCheckout
    }
    const skus = await getSkusByListSkuId({ skuIds: productIds, selectData: ['skuId', 'productId'] })
    skus.forEach(sku => spuIds.add(sku.productId.toString()))
    const spus = await getSpusByListSpuId({ spuIds: [...spuIds], selectData: ['_id', 'product_name', 'product_thumb', 'product_shop', 'product_variations'] })
    return {
        checkout_order,
        item_checkout,
        product_info: spus,
        cart: foundCart
    }
}
const getAllOrderByUserService = async({
    userId,
    limit = 20,
    page = 1
}) => {
    const orders = await getAllOrder({ userId, limit, page})
    return orders
}

const cancelOrderService = async({
    userId,
    orderId
}) => {
    if(!orderId)
        throw new BadRequestError('Order is required')
    const foundOrder = await getOneOrderByUser({ userId, orderId })
    if(!foundOrder)
        throw new NotFoundError('Order not found')

    const order_status = foundOrder.order_status
    return foundOrder
}

//SHOP
const confirmOrderService = async({

}) => {

}

const shipOrderService  = async({

}) => {

}

const completeOrderService  = async({

}) => {

}

const refundOrderService = async({

}) => {

}

module.exports = {
    checkoutOrderReviewService,
    createOrderService,
    getAllOrderByUserService,
    cancelOrderService
}