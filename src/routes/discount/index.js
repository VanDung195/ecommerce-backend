'use strict'

const express = require('express')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const discountController = require('../../controllers/discount.controller')
const { checkShopPermission } = require('../../middleware/shop.middleware')

router.use(authentication)
router.post('/create', checkShopPermission, asyncHandler(discountController.newDiscount))
router.get('/:code', checkShopPermission, asyncHandler(discountController.getOneDiscount))
router.post('/get_recommend_discount', asyncHandler(discountController.getRecommendDiscount))

module.exports = router