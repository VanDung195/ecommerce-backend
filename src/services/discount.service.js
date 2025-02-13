'use strict'

const { NotFoundError, ConflictError, BadRequestError } = require("../core/error.response")
const { getOneCartByUserId } = require("../models/repositories/cart.repo")
const { getOneDiscountCode, createDiscountByShop, getRecommendShopDiscount, getRecommendDiscount, getAllDiscountByShop } = require("../models/repositories/discount.repo")

/*
    truyền vào các products của shopId và check xem discount_applies_to === 'specific' thì tiến hành check xem discount_productIds
*/
const getRecommendShopDiscountService = async({
    userId,
    shopId,
}) => {
    const foundCart = await getOneCartByUserId({ userId })
    if(!foundCart)
        throw new NotFoundError('Cart not found')
    const shopInCart = foundCart.cart_products.find(shop => shop.shopId.toString() === shopId)
    if(!shopInCart)
        throw new NotFoundError('Shop in cart not found')
    const { products, totalPrice} = shopInCart.product_shop.reduce((acc, product) => {
        if(product.isSelected){
            acc.products.push(product.productId)
            acc.totalPrice += product.quantity * product.price
        }
        return acc
    }, { products: [], totalPrice: 0})
    const discount = await getRecommendDiscount({ userId, shopId, products, totalPrice})
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

//freeship discount, flash discount
const createDiscountByAdmin = async({

}) => {

}


const getRecommendPlatformDiscount = async({

}) => {

}

module.exports = {
    createDiscountByShopService,
    getOneDiscoutByShopService,
    getRecommendShopDiscountService,
    getAllDiscountByShopService
}