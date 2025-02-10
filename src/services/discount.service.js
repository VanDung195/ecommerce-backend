'use strict'

const { NotFoundError, ConflictError, BadRequestError } = require("../core/error.response")
const { getOneDiscountCode, createDiscountByShop, getRecommendShopDiscount, getRecommendDiscount } = require("../models/repositories/discount.repo")
const { findShopById, findShopByShopId } = require("../models/repositories/shop.repo")

/*
    truyền vào các products của shopId và check xem discount_applies_to === 'specific' thì tiến hành check xem discount_productIds
*/
const getRecommendShopDiscountService = async({
    userId,
    shopId,
    products
}) => {
    // const discount = await getRecommendShopDiscount({ userId, shopId, products})
    const discount = await getRecommendDiscount({ userId, shopId, products})
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

const deleteDiscountByShop = async({

}) => {

}

const getAllDiscountByShop = async({

}) => {
    
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
    getRecommendShopDiscountService
}