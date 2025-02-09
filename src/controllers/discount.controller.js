'use strict'

const { SuccessResponse } = require("../core/success.response")
const { createDiscountByShopService } = require("../services/discount.service")

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
}

module.exports = new DiscountController()