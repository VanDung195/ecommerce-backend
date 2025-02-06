'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const cartController = require('../../controllers/cart.controller')

router.use(authentication)
router.post('/add_to_cart', asyncHandler(cartController.addToCart))

module.exports = router