'use strict'

const { SuccessResponse } = require("../core/success.response")
const { checkoutOrderReviewService, createOrderService, getAllOrderByUserService } = require("../services/order.service")

class OrderController{
    checkout = async(req, res, next) => {
        new SuccessResponse({
            message: 'Checkout review order success',
            metadata: await checkoutOrderReviewService({ 
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    orderByUser = async(req, res, next) => {
        new SuccessResponse({
            message: 'Order success',
            metadata: await createOrderService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    getAllOrderByUser = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await getAllOrderByUserService({
                userId: req.user.userId,
                ...req.query
            })
        }).send(res)
    }
}

module.exports = new OrderController()