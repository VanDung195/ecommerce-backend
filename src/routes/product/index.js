'use strict'

const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const ProductController = require('../../controllers/product.controller')
const { authentication } = require('../../auth/authUtils')
const { grantAccess } = require('../../middleware/rbac')
const { checkShopPermission } = require('../../middleware/shop.middleware')

router.get('/:slug', asyncHandler(ProductController.oneSpu))

router.use(authentication)

//SPU
router.get('/sku/detail', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(ProductController.listSkuBySpu));
router.post('/spu/new_spu', checkShopPermission, grantAccess('createOwn', 'product'), asyncHandler(ProductController.newSpu));
router.post('/spu/publish', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.publishProductByShop))
router.post('/spu/unPublish', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.unPublishProductByShop))
router.get('/spu/drafts', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(ProductController.getALlDraftProductByShop))
router.get('/spu/publish', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(ProductController.getALlPublishProductByShop))
router.get('/spu/shop', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(ProductController.getALlProductByShop))
router.get('/sku/one', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(ProductController.oneSku))
//SKU
router.patch('/sku/update', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.updateSku))
router.patch('/sku/update/list', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.updateListSku))
// router.get('/sku/update', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.updateSku))

//admin
router.get('/spu/list', grantAccess('readAny', 'product'), asyncHandler(ProductController.allSpu))


module.exports = router