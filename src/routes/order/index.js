'use strict'

const express = require('express')
const router = express.Router()
const { authentication } = require('../../auth/authUtils')
const { asyncHandler } = require('../../helpers/asyncHandler')
const orderController = require('../../controllers/order.controller')

router.use(authentication)
router.post('/checkout', asyncHandler(orderController.checkout))
router.post('/', asyncHandler(orderController.orderByUser))
router.get('/get_all_orders', asyncHandler(orderController.getAllOrderByUser))

module.exports = router
