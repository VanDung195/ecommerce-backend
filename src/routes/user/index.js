'use strict'

const {asyncHandler} = require('../../helpers/asyncHandler')
const UserController = require('../../controllers/user.controller')
const express = require('express')
const router = express.Router()

router.post('/new_user', asyncHandler(UserController.newUser))
// router.get('/welcome', asyncHandler(UserController.checkUserToken))
router.post('/signup', asyncHandler(UserController.signUp))
router.post('/login', asyncHandler(UserController.login))


module.exports = router