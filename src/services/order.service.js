'use strict'

const { NotFoundError, BadRequestError } = require("../core/error.response")
const { getCartByUserId, getListProductFromCart } = require("../models/repositories/cart.repo")
const { checkSkuByServer, checkSkuByServerV2 } = require("../models/repositories/sku.repo")
const { getSeletedProductFromCartService } = require("./cart.service")
const { getDiscountAmountService } = require("./discount.service")

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
        orders: [
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
    user_address,
    user_payment,
    orders
}) => {
    
}

const getOrderService = async({
    orderId
}) => {

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
const checkoutOrderReviewServiceV2 = async({
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

    for(let i = 0; i < shop_order_ids.length; i++){
        const shopId = shop_order_ids[i].shopId
        const products = shop_order_ids[i].item_products.map(product => product.productId);
        const seletedProductFromCart = await getSeletedProductFromCartService({ userId, shopId, products })

        if(shop_order_ids[i].item_products.length !== seletedProductFromCart.products.length)
            throw new BadRequestError('Some product invalid')

        const checkProductServer = await checkSkuByServerV2({ listSku: seletedProductFromCart.products})
        //check product valid (price)
        const hasUndefinedProduct = checkProductServer.some( element => element === undefined)
        if(hasUndefinedProduct){
            throw new BadRequestError('Order wrong')
        }
        const discount = shop_order_ids[i].shop_discount
        if(shopId !== discount.shopId)
            throw new BadRequestError('Order wrong')
        let discountAmount = 0
        if(discount.code !== null){
            discountAmount = await getDiscountAmountService({ userId, shopId: shopId, code: discount.code, products})
        }
        let price_raw = seletedProductFromCart.products.reduce((acc, product) => {
            return acc + product.price * product.quantity
        }, 0)
        const price_apply_discount = price_raw - discountAmount
        //itemCheckout
        item_checkout.push({
            shopId,
            shop_discount: discount,
            price_raw,
            price_apply_discount,
            item_products: seletedProductFromCart.products
        })

        totalPrice += seletedProductFromCart.products.reduce((acc, product) => {
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
    return {
        checkout_order,
        item_checkout
    }
}

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

    for(let i = 0; i < shop_order_ids.length; i++){
        const shopId = shop_order_ids[i].shopId
        const products = shop_order_ids[i].item_products.map(product => product.productId);
        const seletedProductFromCart = await getSeletedProductFromCartService({ userId, shopId, products })

        if(shop_order_ids[i].item_products.length !== seletedProductFromCart.products.length)
            throw new BadRequestError('Some product invalid')
        
        const checkProductServer = await checkSkuByServerV2({ listSku: seletedProductFromCart.products})
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
        let price_raw = seletedProductFromCart.products.reduce((acc, product) => {
            return acc + product.price * product.quantity
        }, 0)
        const price_apply_discount = price_raw - discountAmount
        //itemCheckout
        item_checkout.push({
            shopId,
            shop_discount: discount,
            price_raw,
            price_apply_discount,
            item_products: seletedProductFromCart.products
        })

        totalPrice += seletedProductFromCart.products.reduce((acc, product) => {
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
    return {
        checkout_order,
        item_checkout
    }
}
const cancelOrderService = async({

}) => {

}

const getAllOrderByUserService = async({
    
}) => {

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
    checkoutOrderReviewService
}