'use strict'

const express = require('express')
const {asyncHandler} = require('../../helpers/asyncHandler')
const AccessController = require('../../controllers/access.controller')
const router = express.Router()

router.post('/handler_refresh_token', asyncHandler(AccessController.handlerRefreshToken))

module.exports = router