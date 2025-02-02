'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const spuController = require('../../controllers/spu.controller')
const { authentication } = require('../../auth/authUtils')
const { grantAccess } = require('../../middleware/rbac')
const { checkShopPermission } = require('../../middleware/shop.middleware')

router.get('/:slug', asyncHandler(spuController.oneSpu))

router.use(authentication)

router.get('/sku/detail', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(spuController.listSkuBySpu));
router.post('/spu/new_spu', checkShopPermission, grantAccess('createOwn', 'product'), asyncHandler(spuController.newSpu));
router.get('/sku/one', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(spuController.oneSku))
router.post('/spu/publish', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(spuController.publishProductByShop))
router.post('/spu/unPublish', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(spuController.unPublishProductByShop))
router.get('/spu/drafts', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(spuController.getALlDraftProductByShop))
router.get('/spu/publish', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(spuController.getALlPublishProductByShop))
router.get('/spu/shop', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(spuController.getALlProductByShop))

//admin
router.get('/spu/list', grantAccess('readAny', 'product'), asyncHandler(spuController.allSpu))


module.exports = router