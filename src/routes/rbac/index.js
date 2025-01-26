'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const {authentication} = require('../../auth/authUtils')
const rbacController = require('../../controllers/rbac.controller')
const { grantAccess } = require('../../middleware/rbac')

router.use(authentication)
router.post('/create_resource', grantAccess('createAny', 'resource'), asyncHandler(rbacController.newResource))
router.get('/resources', grantAccess('readAny', 'resource'), asyncHandler(rbacController.listResources))

router.get('/grants', asyncHandler(rbacController.getGrantsDetail))
router.post('/create_role', asyncHandler(rbacController.newRole))
router.get('/get_role_rbac_test', asyncHandler(rbacController.getRoleForRbac))
router.get('/get_role_rbac_test_admin', grantAccess('readOwn', 'resource'), asyncHandler(rbacController.getRoleForRbac))
router.post('/add_role_grant', asyncHandler(rbacController.addRoleGrant))
router.delete('/delete_role_grant', asyncHandler(rbacController.deleteRoleGrant))
router.post('/update_role_grant', asyncHandler(rbacController.updateRoleGrant))


module.exports = router