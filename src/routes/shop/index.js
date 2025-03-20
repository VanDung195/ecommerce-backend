'use strict'

const express = require('express')
const {asyncHandler} = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const { newShop } = require('../../controllers/shop.controller')
const shopController = require('../../controllers/shop.controller')
const { checkShopPermission } = require('../../middleware/shop.middleware')
const router = express.Router()

router.use(authentication)
router.post('/new_shop', asyncHandler(shopController.newShop))
router.get('/my_shop', checkShopPermission, asyncHandler(shopController.getShopByUserId))
router.delete('/', checkShopPermission, asyncHandler(shopController.deleteShopByUser))
//admin
router.get('/', asyncHandler(shopController.getAllShop))

module.exports = router