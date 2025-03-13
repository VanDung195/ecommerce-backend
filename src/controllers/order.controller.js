'use strict'

const { SuccessResponse } = require("../core/success.response")
const { checkoutOrderReviewService, createOrderService, getAllOrderByUserService, cancelOrderService, confirmOrderByShopService, shippingOrderByShopService, deliveryOrderByShopService, completeOrderByShopService, confirmCancelledOrderByShopService, getAllOrderByShopService, getOrderDetailByUserService, getOrderDetailByShopService, confirmOrderCancellationByShopService, rejectOrderCancellationByShopService } = require("../services/order.service")

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

    getOrderDetailByUser = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await getOrderDetailByUserService({
                userId: req.user.userId,
                ...req.params
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
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }
    
    shippingOrderByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await shippingOrderByShopService({ 
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }
    
    deliveryOrderByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await deliveryOrderByShopService({ 
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    completeOrderByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await completeOrderByShopService({ 
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    confirmOrderCancellationByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await confirmOrderCancellationByShopService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    rejectOrderCancellationByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await rejectOrderCancellationByShopService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    getAllOrderByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await getAllOrderByShopService({
                shopId: req.shop._id,
                ...req.query
            })
        }).send(res)
    }

    getOrderDetailByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await getOrderDetailByShopService({
                shopId: req.shop._id,
                ...req.params
            })
        }).send(res)
    }
}

module.exports = new OrderController()