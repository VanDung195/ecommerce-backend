'use strict'

const express = require('express')
const router = express.Router()
const { authentication } = require('../../auth/authUtils')
const { asyncHandler } = require('../../helpers/asyncHandler')
const orderController = require('../../controllers/order.controller')
const { checkShopPermission } = require('../../middleware/shop.middleware')

router.use(authentication)
router.post('/checkout', asyncHandler(orderController.checkout))
router.post('/', asyncHandler(orderController.orderByUser))
router.get('/get_all_orders', asyncHandler(orderController.getAllOrderByUser))
router.post('/cancel', asyncHandler(orderController.cancelOrderByUser))
router.get('/detail/:orderId', asyncHandler(orderController.getOrderDetailByUser))
//shop
router.post('/confirm', checkShopPermission, asyncHandler(orderController.confirmOrderByShop))
router.post('/shipping', checkShopPermission, asyncHandler(orderController.shippingOrderByShop))
router.post('/delivery', checkShopPermission, asyncHandler(orderController.deliveryOrderByShop))
router.post('/complete', checkShopPermission, asyncHandler(orderController.completeOrderByShop))
router.get('/detail/shop/:orderId', checkShopPermission, asyncHandler(orderController.getOrderDetailByShop))

router.post('/confirm_cancellation_order', checkShopPermission, asyncHandler(orderController.confirmOrderCancellationByShop))
router.post('/reject_cancellation_order', checkShopPermission, asyncHandler(orderController.rejectOrderCancellationByShop))
router.get('/get_all_orders_shop', checkShopPermission, asyncHandler(orderController.getAllOrderByShop))

module.exports = router
