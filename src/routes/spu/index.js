'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const spuController = require('../../controllers/spu.controller')

router.post('/new_spu', asyncHandler(spuController.newSpu))

module.exports = router