'use strict'

const { SuccessResponse } = require("../core/success.response")
const { checkoutOrderReviewService } = require("../services/order.service")

class OrderController{
    checkout = async(req, res, next) => {
        new SuccessResponse({
            message: 'Checkout order success',
            metadata: await checkoutOrderReviewService({ 
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }
}

module.exports = new OrderController()