'use strict'

const express = require('express')
const {asyncHandler} = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const { newShop } = require('../../controllers/shop.controller')
const shopController = require('../../controllers/shop.controller')
const router = express.Router()

router.use(authentication)
router.post('/new_shop', asyncHandler(shopController.newShop))
router.get('/my_shop', asyncHandler(shopController.getShopByUserId))
router.get('/', asyncHandler(shopController.getShopByUserId))

module.exports = router