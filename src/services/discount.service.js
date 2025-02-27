'use strict'

const { NotFoundError, ConflictError, BadRequestError } = require("../core/error.response")
const { getCartByUserId, getShopInCart } = require("../models/repositories/cart.repo")
const { getOneDiscountCode, createDiscountByShop, getRecommendDiscount, getAllDiscountByShop } = require("../models/repositories/discount.repo")
const { getSeclectedProductFromCartService } = require("./cart.service")

/*
    truyền vào các products của shopId và check xem discount_applies_to === 'specific' thì tiến hành check xem discount_productIds
*/
const getRecommendShopDiscountService = async({
    userId,
    shopId,
    products = []
}) => {
    // const foundCart = await getCartByUserId({ userId })
    // if(!foundCart)
    //     throw new NotFoundError('Cart not found')
    // const shopInCart = await getShopInCart({ userId, shopId})
    //lấy ra giá tiền và só lượng của sản phẩm
    const seletedProducts = await getSeclectedProductFromCartService({ userId, shopId, products})
    const discount = await getRecommendDiscount({ userId, shopId, products: seletedProducts.products})
    return discount
}

const createDiscountByShopService = async({
    shopId,
    discount
}) => {
    const foundDiscount = await getOneDiscountCode({
        shopId,
        code: discount.code
    })
    if(foundDiscount)
        throw new ConflictError('Discout aldready exists')

    const now = new Date()
    const startDate = new Date(discount.start_date)
    const endDate = new Date(discount.end_date)

    if(isNaN(startDate) || isNaN(endDate))
        throw new BadRequestError('Invalid start date or end date')
    if(now > startDate || now > endDate)
        throw new BadRequestError('Discount has expired')
    if(startDate > endDate)
        throw new BadRequestError('Start date must be before end date')
    
    const newDiscount = await createDiscountByShop({
        shopId,
        discount
    })
    if(!newDiscount)
        throw new BadRequestError('Something went wrong')
    return newDiscount
}

const updateDiscountByShopService = async({

}) => {

}

const isValidDiscount = async({

}) => {

}

const applyDiscountToProduct = async({
    product,
    discount
}) => {

}

const deleteDiscountByShop = async({

}) => {

}

const getAllDiscountByShopService = async({
    shopId,
    page = 1,
    limit = 20
}) => {
    const discounts = await getAllDiscountByShop({
        shopId,
        page,
        limit
    })
    if(!discounts) 
        throw new NotFoundError('Discount not found')
    return discounts
}

const getOneDiscoutByShopService = async({
    shopId,
    code
}) => {
    const foundDiscount = await getOneDiscountCode({ shopId, code })
    if(!foundDiscount)
        throw new NotFoundError('Discount not found')
    return foundDiscount
}

const createDiscountByAdmin = async({

}) => {

}

const getRecommendPlatformDiscount = async({

}) => {

}

const getDiscountAmountService = async({
    userId,
    shopId,
    code,
    products
}) => {
    const foundDiscount = await getOneDiscountCode({ shopId, code})
    if(!foundDiscount)
        throw new NotFoundError('Discount not found')
    const foundCart = await getCartByUserId({ userId })
    if(!foundCart)
        throw new NotFoundError('Cart not found')
    const shopInCart = await getShopInCart({ userId, shopId })
    if(!shopInCart)
        throw new NotFoundError('Shop in cart not found')
    //check start date and end date valid
    const now = new Date()
    const startDate = new Date(foundDiscount.discount_start_date)
    const endDate = new Date(foundDiscount.discount_end_date)
    if(isNaN(startDate) || isNaN(endDate))
        throw new BadRequestError('Invalid start date or end date')
    if(now > endDate)
        throw new BadRequestError('Discount has expired')
    if(startDate > endDate)
        throw new BadRequestError('Start date must before end date')
    if(foundDiscount.discount_uses_count === foundDiscount.discount_max_uses){
        throw new BadRequestError('Disount code has reached its usage limit')
    }
    const seletedProducts = {
        shopId,
        products: []
    }
    shopInCart.product_shop.map( product => {
        if(products.includes(product.productId)){
            seletedProducts.products.push(product)
        }
    })
    //check product valid for discount
    let eligibleProducts = []
    if(foundDiscount.discount_applies_to === 'all')
        eligibleProducts = shopInCart.product_shop.map(product => product)
    if(foundDiscount.discount_applies_to === 'specific'){
        eligibleProducts = shopInCart.product_shop.filter(product => {
            foundDiscount.discount_productIds.includes(product.productId)
        })
    }
    if(eligibleProducts.length === 0)
        throw new BadRequestError('No eligible product found for discount')
    const shopTotalPrice = shopInCart.product_shop.reduce((total, product) => {
        return total + product.quantity * product.price
    }, 0)
    //check minimum amount
    if(foundDiscount.discount_min_order_value > shopTotalPrice && foundDiscount.discount_min_order_value !== 0){
        throw new BadRequestError(`Order total doesn't meet the discount`)
    }
    //select 1 product to apply discout (highest priced product)
    const productToDiscount = eligibleProducts.reduce( (pre, current) => {
        return (pre.price > current.price ? pre : current)
    })
    const discountType = foundDiscount.discount_type
    let discountValue = 0
    if(discountType === 'fixed_amount'){
        discountValue = foundDiscount.discount_value
    } else {
        const percentageDiscount = (+foundDiscount.discount_value / 100) * productToDiscount.price
        const maxAmount = foundDiscount.discount_max_amount
        discountValue = (maxAmount !== 0 && percentageDiscount > maxAmount ? maxAmount : percentageDiscount)
    }
    return discountValue
}

/*
{
    "shopId": "679dd8efddf5bd2cc2cd5ba7",
    "product_shop": [
        {
            "productId": "67a5bd55936d645bcc8f62ee811-679dd8efddf5bd2cc2cd5ba7",
            "name": "Áo thun!!!",
            "price": 1500,
            "quantity": 2
        },
        {
            "productId": "67a5bd55936d645bcc8f62ee892-679dd8efddf5bd2cc2cd5ba7",
            "name": "Áo thun đỏ!!!",
            "price": 1600,
            "quantity": 2
        }
    ]
}

*/

module.exports = {
    createDiscountByShopService,
    getOneDiscoutByShopService,
    getRecommendShopDiscountService,
    getAllDiscountByShopService,
    getDiscountAmountService
}