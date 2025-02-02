'use strict'

const { AuthFailureError } = require("../core/error.response")
const { findShopByUserId } = require("../models/repositories/shop.repo")

const checkShopPermission = async (req, res, next) => {
    try {
        const user = req.user
        const foundShop = await findShopByUserId({ userId: user.userId })
        if (!foundShop) throw new AuthFailureError('Shop not registered')

        req.shop = foundShop
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    checkShopPermission
}
