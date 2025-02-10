'use strict'

const { SuccessResponse } = require("../core/success.response")
const { createDiscountByShopService, getOneDiscoutByShopService, getRecommendShopDiscountService } = require("../services/discount.service")

class DiscountController {
    newDiscount = async(req, res, next) => {
        new SuccessResponse({
            message: 'Create new discount success',
            metadata: await createDiscountByShopService({
                shopId: req.shop._id,
                discount: req.body
            })
        }).send(res)
    }

    getOneDiscount = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get one discount success',
            metadata: await getOneDiscoutByShopService({
                shopId: req.shop._id,
                code: req.params.code
            })
        }).send(res)
    }

    getRecommendDiscount = async(req, res, next) => {
        new SuccessResponse({
            message: 'OK',
            metadata: await getRecommendShopDiscountService({
                userId: req.user.userId,
                shopId: req.body.shop,
                products: ['67a5bd55936d645bcc8f62ee892-679dd8efddf5bd2cc2cd5ba7', '67a5bd55936d645bcc8f62ee811-679dd8efddf5bd2cc2cd5ba7']
            })
        }).send(res)
    }
}

module.exports = new DiscountController()