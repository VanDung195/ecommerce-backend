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
router.post('/confirm', checkShopPermission, asyncHandler(orderController.confirmOrderByShop))
router.post('/shipping', checkShopPermission, asyncHandler(orderController.shippingOrderByShop))
router.post('/delivery', checkShopPermission, asyncHandler(orderController.deliveryOrderByShop))
router.post('/complete', checkShopPermission, asyncHandler(orderController.completeOrderByShop))

router.post('/confirm_cancelled_order', checkShopPermission, asyncHandler(orderController.confirmCancelledOrderByShop))
router.get('/get_all_orders_shop', checkShopPermission, asyncHandler(orderController.getAllOrderByShop))

module.exports = router
