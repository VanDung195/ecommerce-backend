'use strict'

const { AuthFailureError, BadRequestError } = require("../core/error.response")
const { findShopByUserId } = require("../models/repositories/shop.repo")

const checkShopPermission = async (req, res, next) => {
    try {
        const user = req.user
        const foundShop = await findShopByUserId({ userId: user.userId })
        if (!foundShop) throw new AuthFailureError('Shop not registered')
        if(!foundShop.shop_verify) throw new BadRequestError('Unverified shop')
        if(foundShop.shop_status !== 'active') throw new BadRequestError('Shop has been banned')
        req.shop = foundShop
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    checkShopPermission
}
