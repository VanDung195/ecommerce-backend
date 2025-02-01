'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const spuController = require('../../controllers/spu.controller')
const { authentication } = require('../../auth/authUtils')
const { grantAccess } = require('../../middleware/rbac')

router.get('/:slug', asyncHandler(spuController.oneSpu))

router.use(authentication)
router.get('/sku/detail', grantAccess('readOwn', 'product'), asyncHandler(spuController.listSkuBySpu));
router.post('/spu/new_spu', grantAccess('createOwn', 'product'), asyncHandler(spuController.newSpu));
router.get('/sku/one', grantAccess('readOwn', 'product'), asyncHandler(spuController.oneSku))


//admin
router.get('/spu/list', grantAccess('readAny', 'product'), asyncHandler(spuController.allSpu))
router.post('/spu/publish', grantAccess('updateOwn', 'product'), asyncHandler(spuController.publishProductByShop))
router.post('/spu/unPublish', grantAccess('updateOwn', 'product'), asyncHandler(spuController.unPublishProductByShop))

module.exports = router