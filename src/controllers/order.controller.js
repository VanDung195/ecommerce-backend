'use strict'

const { SuccessResponse } = require("../core/success.response")
const { checkoutOrderReviewService, createOrderService, getAllOrderByUserService, cancelOrderService, confirmOrderByShopService, shippingOrderByShopService, deliveryOrderByShopService, completeOrderByShopService } = require("../services/order.service")

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

    cancelOrderByUser = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await cancelOrderService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    confirmOrderByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await confirmOrderByShopService({ 
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }
    
    shippingOrderByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await shippingOrderByShopService({ 
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }
    
    deliveryOrderByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await deliveryOrderByShopService({ 
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    completeOrderByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await completeOrderByShopService({ 
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }
}

module.exports = new OrderController()