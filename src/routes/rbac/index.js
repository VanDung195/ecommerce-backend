'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const {authentication} = require('../../auth/authUtils')
const rbacController = require('../../controllers/rbac.controller')

router.use(authentication)
router.post('/create_resource', asyncHandler(rbacController.newResource))
router.get('/resources', asyncHandler(rbacController.listResources))

router.post('/create_role', asyncHandler(rbacController.newRole))


module.exports = router