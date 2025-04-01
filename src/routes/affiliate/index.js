'use strict'

const express = require('express')
const cookieParser = require('cookie-parser');
const router= express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const affiliateController = require('../../controllers/affiliate.controller')
const { grantAccess } = require('../../middleware/rbac')
const { checkShopPermission } = require('../../middleware/shop.middleware')
const checkSellerAffiliatePermission = require('../../middleware/sellerAffiliate.middleware')
router.use(cookieParser())
router.get('/record_click', asyncHandler(affiliateController.recordClick))
router.get('/t/:shortUrl', asyncHandler(affiliateController.redirectToDestinationUrl))
router.get('/:slug', asyncHandler(affiliateController.handlerDestinationUrl))
router.use(authentication)
//seller
router.post('/seller/create', checkShopPermission, asyncHandler(affiliateController.newSellerAffiliate))
router.post('/seller/affiliate-links', checkSellerAffiliatePermission, asyncHandler(affiliateController.createAffiliateLinkBySeller))
//partner
router.post('/partner/create', asyncHandler(affiliateController.newPartnerAffiliate))

router.post('', asyncHandler(affiliateController.newAffiliate))


router.post('/admin/verify/:affiliateId', grantAccess('updateAny', 'affiliate'), asyncHandler(affiliateController.verifyAffiliate))
router.post('/admin/reject/:affiliateId', grantAccess('updateAny', 'affiliate'), asyncHandler(affiliateController.rejectAffiliate))
router.post('/admin/affiliate-payouts', grantAccess('updateAny', 'affiliate'), asyncHandler(affiliateController.processAffiliatePayouts))
module.exports = router