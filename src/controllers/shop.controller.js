'use strict'

const { SuccessResponse } = require("../core/success.response")
const { newShop, getShopByUserId, getAllShop } = require("../services/shop.service")

class ShopController{
    newShop = async(req, res, next) => {
        const { name, email, address, phone} = req.body
        new SuccessResponse({
            message: 'Create new shop successfuly',
            metadata: await newShop({
                userId: req.user.userId, //from authentication middleware
                name,
                email,
                address, 
                phone
            })
        }).send(res)
    }

    getShopByUserId = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get shop success',
            metadata: await getShopByUserId({
                userId: req.user.userId
            })
        }).send(res)
    }

    getAllShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get all shops',
            metadata: await getAllShop(req.query)
        }).send(res)
    }
}

module.exports = new ShopController()