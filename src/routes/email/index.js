'use strict'

const express = require('express')
const {asyncHandler} = require('../../helpers/asyncHandler')
const emailController = require('../../controllers/email.controller')
const router = express.Router()

router.post('/send_email', asyncHandler(emailController.sendEmail))

module.exports = router