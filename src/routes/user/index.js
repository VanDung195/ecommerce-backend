'use strict'

const {asyncHandler} = require('../../helpers/asyncHandler')
const UserController = require('../../controllers/user.controller')
const express = require('express')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

// router.get('/welcome', asyncHandler(UserController.checkUserToken))
router.post('/signup', asyncHandler(UserController.signUp))
router.post('/login', asyncHandler(UserController.login))
router.post('/new_user', asyncHandler(UserController.newUser))

router.use(authentication)

router.post('/block_user', asyncHandler(UserController.blockUser))
router.post('/unblock_user', asyncHandler(UserController.unBlockUser))

module.exports = router