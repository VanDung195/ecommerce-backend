'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const cartController = require('../../controllers/cart.controller')

router.use(authentication)

router.post('/add_to_cart', asyncHandler(cartController.addToCart))
router.delete('/clear', asyncHandler(cartController.clearCart))
router.post('/update', asyncHandler(cartController.updateQuantity))
router.get('', asyncHandler(cartController.listToCart))
router.delete('/remove', asyncHandler(cartController.removeFromCart))
router.post('/toggle', asyncHandler(cartController.toggleSelectionProductFromCart))

module.exports = router