'use strict'

const mongoose  = require("mongoose")
const { NotFoundError, BadRequestError } = require("../core/error.response")
const { getCartByUserId, getListProductFromCart, updateCartCount, removeFromCart, removeCartShop } = require("../models/repositories/cart.repo")
const { createOrder, getOneOrderByUser, cancelOrder, updateOrderStatusHistory, getOneOrderByShop, getAllOrderByUser, getAllOrderByShop, getOrderDetailByUser, getOrderDetailByShop, confirmOrderCancellation, rejectOrderCancellation } = require("../models/repositories/order.repo")
const { getSpusByListSpuId } = require("../models/repositories/spu.repo")
const { getSeclectedProductFromCartService } = require("./cart.service")
const { getDiscountAmountService } = require("./discount.service")
const { aquireLock, releaseLock } = require("./redis.service")
const { getReservationByOrderId, releaseReservedInventory  } = require("../models/repositories/inventory.repo")
const { producerOrderMessage, producerOrderCancellationEvent } = require("../queues/order.producer")
const { ORDER_STATUSES } = require("../configs/constant")
const { checkSkuByServerV2, getSkusByListSkuId } = require("../models/repositories/sku.repo")
const { convertToObjectIdMongodb } = require("../utils")
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
//use transaction!!!!!
const createOrderService = async({
    userId,
    user_address,
    user_payment,
    order_note = '',
    shop_order_ids
}) => {
    const { item_checkout, cart } = await checkoutOrderReviewService({ userId, shop_order_ids})
    const cartId = cart._id
    for(let i = 0; i < item_checkout.length; i++){
        let validProducts = []
        const aquireProducts = []
        const itemProducts = []
        const orderObjectId = new mongoose.Types.ObjectId()
        const shopOrderId = item_checkout[i]
        const orderProducts = {
            shopId: shopOrderId.shop.shopId,
            shop_discount: shopOrderId.shop_discount
        }
        for(let j = 0; j < shopOrderId.item_products.length; j++){
            const product = shopOrderId.item_products[j]
            const { productId, quantity } = product
            const keyLock = await aquireLock({ productId, quantity, cartId, orderId: orderObjectId})
            aquireProducts.push(keyLock ? true : false)
            if(keyLock !== null){
                const { key, uniqueValue } = keyLock
                await releaseLock({ keyLock: key, expectedValue: uniqueValue })

                validProducts.push({
                    orderId: orderObjectId,
                    productId: product.productId,
                    quantity: product.quantity
                })
            }
            itemProducts.push({
                productId: productId,
                price: product.price,
                quantity: product.quantity
            })
        }
        orderProducts.item_products = itemProducts
        const checkout = {
            total_price: shopOrderId.price_raw,
            total_apply_discount: shopOrderId.price_raw - shopOrderId.price_apply_discount,
            total_checkout: shopOrderId.price_apply_discount,
            fee_ship: 0
        }
        if(aquireProducts.includes(false)){
            await releaseReservedInventory ({ products: validProducts })
            const now = () => new Date()
            const order = await createOrder({
                _id: orderObjectId,
                userId,
                order_checkout: checkout,
                shipping: user_address,
                payment: user_payment,
                order_products: orderProducts,
                order_note,
                order_cancellation: {
                    shop_reason: {
                        code: 'out_of_stock',
                        detail: 'Some product out of stock'
                    },
                    cancelledAt: now,
                    shop_approval: 'approved',
                    approvedAt: now
                },
            })
            if(!order)
                throw new BadRequestError('Create order failure')
        } else {
            const order = await createOrder({
                _id: orderObjectId,
                userId,
                order_checkout: checkout,
                shipping: user_address,
                payment: user_payment,
                order_products: orderProducts,
                order_note,
                order_cancellation: null
            })
            if(!order)
                throw new BadRequestError('Create order failure')
            await producerOrderMessage({userId, orderProducts: orderProducts})
        }
    }
    return item_checkout
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
    page = 1,
    status = 6
}) => {
    const orders = await getAllOrderByUser({ userId, status: ORDER_STATUSES[status], limit, page})
    return orders
}

const cancelOrderService = async({
    userId,
    orderId,
    code = 'other',
    detail = ''
}) => {
    if (!orderId) throw new BadRequestError('Order is required')
    const foundOrder = await getOneOrderByUser({ userId, orderId })
    if (!foundOrder) throw new NotFoundError('Order not found')
    const { order_status } = foundOrder
    const cancellationInfo = { reason: { code, detail } }
    switch (order_status) {
        case 'pending':
            cancellationInfo.shop_approval = 'approved'
            break
        case 'confirmed':
            cancellationInfo.shop_approval = 'pending'
            break;
        default:
            throw new BadRequestError('Order status invalid')
    }
    const cancelledOrder = await cancelOrder({ userId, orderId, cancellation_info: cancellationInfo, order_status })
    if (!cancelledOrder) throw new BadRequestError('Cancel order failed!')
    if(order_status === 'pending'){
        await updateOrderStatusHistory({ userId, orderId, status: 'cancelled'})
        //un reservations product in inventories model
        const reservationProducts = await getReservationByOrderId({ orderId })
        if(!reservationProducts)
            throw new NotFoundError('Reservation products not found')
        await releaseReservedInventory ({ products: reservationProducts })
    }
    return cancelledOrder
}

const getOrderDetailByUserService = async({ userId, orderId }) => {
    const order = await getOrderDetailByUser({ userId, orderId })
    if(!order)
        throw new NotFoundError('Your order not found')
    return order
}

////////////////
//   SHOP    //
//////////////
const updateOrderStatusHistoryService = async({shopId, orderId, validStatus, status }) => {
    if(!orderId) throw new BadRequestError('Order is required')
    const foundOrder = await getOneOrderByShop({ shopId, orderId })
    if(!foundOrder) throw new NotFoundError('Order not found')
    if(foundOrder.order_cancellation && foundOrder.order_cancellation.shop_approval === 'pending')
        throw new BadRequestError('Current order status does not allow this action')
    const userId = foundOrder.order_userId
    const { order_status } = foundOrder
    if(order_status !== validStatus)
        throw new BadRequestError('Current order status does not allow this action')
    const updatedOrderStatusHistory = await updateOrderStatusHistory({ userId, orderId, status})
    if(!updatedOrderStatusHistory) throw new BadRequestError('Update order status failed')
    if(status === 'conpleted'){
        //un reservation in inventories model
        const reservationProducts = await getReservationByOrderId({ orderId })
        if(!reservationProducts)
            throw new NotFoundError('Reservation products not found')
        await releaseReservedInventory ({ products: reservationProducts })
    }
    return updatedOrderStatusHistory
}

const getReservationProductTest = async({ orderId }) => {
    console.log(orderId)
    const order = await getOneOrderByShop({ shopId: convertToObjectIdMongodb('67a848495fa5509c47c0c613'), orderId})
    await producerOrderCancellationEvent({ order })
    return order
    // return await getReservationByOrderId({ orderId })
}

const updateOrderStatusService = (validStatus, newStatus) => async({ shopId, orderId }) => {
    return updateOrderStatusHistoryService({ shopId, orderId, validStatus, status: newStatus})
}

const confirmOrderByShopService = updateOrderStatusService('pending', 'confirmed');
const shippingOrderByShopService = updateOrderStatusService('confirmed', 'shipping');
const deliveryOrderByShopService = updateOrderStatusService('shipping', 'pending_delivery');
const completeOrderByShopService = updateOrderStatusService('pending_delivery', 'completed');
const completeOrderByShopServiceV2 = async() => {
    const validStatus = 'pending_delivery'
    const newStatus = 'completed'
    const updatedOrderStatus = updateOrderStatusService(validStatus, newStatus)
    if(!updatedOrderStatus)
        throw new BadRequestError('Failed to complete order')
    return updatedOrderStatus
}

const getAllOrderByShopService = async({ shopId, limit = 20, page = 1, status = 6 }) => {
    const orders = await getAllOrderByShop({ shopId, status: ORDER_STATUSES[status], limit, page})
    return orders
}

const getOrderDetailByShopService = async({ shopId, orderId }) => {
    const order = await getOrderDetailByShop({ shopId, orderId })
    if(!order)
        throw new NotFoundError('Order not found')
    return order
}

const confirmOrderCancellationByShopService = async({ shopId, orderId }) => {
    if(!orderId)
        throw new BadRequestError('Invalid order')
    const foundOrder = await getOneOrderByShop({ shopId, orderId})
    if(!foundOrder)
        throw new NotFoundError('Order not found')
    const { order_status, order_cancellation } = foundOrder
    if(!order_cancellation || order_cancellation.shop_approval !== 'pending' || order_status !== 'confirmed')
        throw new BadRequestError('Current order status does not allow this action')
    const updatedOrder = await confirmOrderCancellation({ shopId, orderId })
    if(!updatedOrder)
        throw new BadRequestError('Confirm order cancellation failure')
    const reservationProducts = await getReservationByOrderId({ orderId })
    if(!reservationProducts)
        throw new NotFoundError('Reservation products not found')
    await releaseReservedInventory ({ products: reservationProducts })
    return updatedOrder
}

const rejectOrderCancellationByShopService = async({ shopId, orderId, code = 'other', detail = '' }) => {
    if(!orderId)
        throw new BadRequestError('Invalid order')
    const foundOrder = await getOneOrderByShop({ shopId, orderId })
    if(!foundOrder) 
        throw new NotFoundError('Order not found')
    const { order_status, order_cancellation } = foundOrder
    if(!order_cancellation || order_cancellation.shop_approval !== 'pending' || order_status !== 'confirmed')
        throw new BadRequestError('Current order status does not allow this action')
    const updatedOrder = await rejectOrderCancellation({ shopId, orderId, code, detail})
    if(!updatedOrder)
        throw new BadRequestError('Reject order cancellation failure')
    return updatedOrder
}

const refundOrderService = async({ shopId, orderId, code = 'other', detail = '' }) => {

}

module.exports = {
    checkoutOrderReviewService,
    createOrderService,
    getAllOrderByUserService,
    cancelOrderService,
    confirmOrderByShopService,
    shippingOrderByShopService,
    deliveryOrderByShopService,
    completeOrderByShopService,
    confirmOrderCancellationByShopService,
    getAllOrderByShopService,
    getOrderDetailByUserService,
    getOrderDetailByShopService,
    rejectOrderCancellationByShopService,
    getReservationProductTest
}