'use strict'

const express = require('express')
const {asyncHandler} = require('../../helpers/asyncHandler')
const AccessController = require('../../controllers/access.controller')
const {authentication} = require('../../auth/authUtils')
const router = express.Router()

// router.post('/user/login', asyncHandler(AccessController.login))

router.use(authentication)

router.post('/handler_refresh_token', asyncHandler(AccessController.handlerRefreshToken))

module.exports = router