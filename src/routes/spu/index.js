'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const spuController = require('../../controllers/spu.controller')
const { authentication } = require('../../auth/authUtils')

router.use(authentication)
router.post('/new_spu', asyncHandler(spuController.newSpu))
router.get('/:slug', asyncHandler(spuController.oneSpu))

module.exports = router