'use strict'

const express = require('express')
const router= express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const affiliateController = require('../../controllers/affiliate.controller')
const { grantAccess } = require('../../middleware/rbac')

router.get('/record_click', asyncHandler(affiliateController.recordClick))

router.use(authentication)
router.post('', asyncHandler(affiliateController.newAffiliate))


router.post('/admin/verify/:affiliateId', grantAccess('updateAny', 'affiliate'), asyncHandler(affiliateController.verifyAffiliate))
router.post('/admin/reject/:affiliateId', grantAccess('updateAny', 'affiliate'), asyncHandler(affiliateController.rejectAffiliate))

module.exports = router