'use strict'

const { SuccessResponse } = require("../core/success.response")
const { createDiscountByShopService, getOneDiscoutByShopService, getRecommendShopDiscountService, getAllDiscountByShopService, getDiscountAmountService } = require("../services/discount.service")

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
                shopId: req.body.shop
            })
        }).send(res)
    }

    getAllDiscount = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get all discounts success',
            metadata: await getAllDiscountByShopService({
                shopId: req.shop._id,
                ...req.query
            })
        }).send(res)
    }

    getDiscountAmount = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get discount amount successfully',
            metadata: await getDiscountAmountService({ 
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }
}

module.exports = new DiscountController()