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
router.patch('/spu/delete_variation', checkShopPermission, grantAccess('deleteOwn', 'product'), asyncHandler(ProductController.deleteProductVariation))
router.patch('/spu/add_variation', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.addProductVariation))
router.patch('/spu/update_variation_options', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.updateVariationOptions))
//SKU
router.get('/sku/one', checkShopPermission, grantAccess('readOwn', 'product'), asyncHandler(ProductController.oneSku))
router.patch('/sku/update', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.updateSku))
router.patch('/sku/update/list', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.updateListSku))
router.post('/sku/publish', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.publishSku))
router.post('/sku/unPublish', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.unPublishSku))
router.patch('/sku/set_default', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.setDefaultSku))
router.patch('/sku/unset_default', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.unsetDefaultSku))
router.post('/sku/new_one_sku', checkShopPermission, grantAccess('createOwn', 'product'), asyncHandler(ProductController.createOneSKu))
router.post('/sku/new_list_sku', checkShopPermission, grantAccess('createOwn', 'product'), asyncHandler(ProductController.createListSKu))

router.post('/spu/test', checkShopPermission, asyncHandler(ProductController.testNhe))

// router.get('/sku/update', checkShopPermission, grantAccess('updateOwn', 'product'), asyncHandler(ProductController.updateSku))

//admin
router.get('/spu/list', grantAccess('readAny', 'product'), asyncHandler(ProductController.allSpu))


module.exports = router