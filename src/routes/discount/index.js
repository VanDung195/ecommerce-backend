'use strict'

const express = require('express')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const discountController = require('../../controllers/discount.controller')

router.use(authentication)
router.post('/create', asyncHandler(discountController.newDiscount))

module.exports = router