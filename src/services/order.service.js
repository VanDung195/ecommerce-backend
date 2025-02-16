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
const checkoutOrderReviewService = async({
    userId,
    shop_order_ids = []
}) => {
    const foundCart = await getCartByUserId({ userId })
    if(!foundCart)
        throw new NotFoundError('Cart not found')
    const checkout_order = {
        totalPrice: 0, //tong tien hang
        feeShip: 0, //phí vận chuyển
        totalDiscount: 0, //tổng giảm giá bao nhiêu trên đơn hàng (nó giảm bao nhiêu)
        totalCheckout: 0 //tổng thanh toán
    }
    // const itemCheckout = {
    //     shopId,
    //     shop_discounts,
    //     priceRaw: checkoutPrice, //tong gia tri truoc khi giam gia
    //     priceApplyDiscount: checkoutPrice,
    //     item_products: checkProductServer
    // }
    const itemCheckout = {}
    let totalPrice = 0
    let totalDiscount = 0
    let totalCheckout = 0

    for(let i = 0; i < shop_order_ids.length; i++){
        const shopId = shop_order_ids[i].shopId
        const products = shop_order_ids[i].item_products.map(product => product.productId);
        const seletedProductFromCart = await getSeletedProductFromCartService({ userId, shopId, products })
        console.log(seletedProductFromCart);

        const checkProductServer = await checkSkuByServerV2({ listSku: seletedProductFromCart.products})

        //check product valid (price)
        const hasUndefinedProduct = checkProductServer.some( element => element === undefined)
        if(hasUndefinedProduct){
            throw new BadRequestError('Order wrong')
        }
        
        

        //get shopid
        const skuId = shop_order_ids[i].item_products[0].productId
        const spuId = skuId.split('-')[0].slice(0, -3)
        
        // const check = await checkSkuByServer({ })

        const shop = shop_order_ids[i].shopId
        const discount = shop_order_ids[i].shop_discount
        let discountAmount = 0
        if(discount.code !== null){
            discountAmount = await getDiscountAmountService({ userId, shopId: shop, code: discount.code, products})
        }
    }
    //check product from server
    //check discount
    //apply discount
    //get product from cart
    
    // const productFromCart = await getSeletedProductFromCartService({ userId })
    // // return productFromCart
    // return productFromCart
    // return foundCart
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