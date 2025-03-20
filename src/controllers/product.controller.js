'use strict'

const { SuccessResponse } = require('../core/success.response')
const { updateOneSkuService, updateListSkuService, publishSkuService, unPublishSkuService, setDefaultSkuService, unsetDefaultSkuService, createOneSkuService, createListSkuService } = require('../services/sku.service')
const { createSpuService, getOneSpuService, getListSkuBySpuIdService, getOneSkuService, getAllSpuService, publishProductByShopService, unPublishProductByShopService, getAllDraftsForShopService, getAllPublicForShopService, getAllProductForShopService, deleteProductVariationService, addProductVariationService, testNhe, updateVariationOptionsService, getOneSpuDetailByShopService } = require('../services/spu.service')

class ProductController {
    newSpu = async(req, res, next) => {
        new SuccessResponse({
            message: 'Create spu success',
            metadata: await createSpuService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    oneSpu = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get one spu success',
            metadata: await getOneSpuService(req.params)
        }).send(res)
    }

    listSkuBySpu = async(req, res, next) => {
        console.log(req.query);
        new SuccessResponse({
            message: 'Get list sku success',
            metadata: await getListSkuBySpuIdService(req.query)
        }).send(res)
    }

    oneSku = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get one sku success',
            metadata: await getOneSkuService(req.body)
        }).send(res)
    }

    allSpu = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list all spu success',
            metadata: await getAllSpuService(req.query)
        }).send(res)
    }

    publishProductByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Publish product success',
            metadata: await publishProductByShopService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    unPublishProductByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Un publish product success',
            metadata: await unPublishProductByShopService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    getALlDraftProductByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list draft product success',
            metadata: await getAllDraftsForShopService({
                product_shop: req.shop._id,
                ...req.query
            })
        }).send(res)
    }

    getALlPublishProductByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list public product success',
            metadata: await getAllPublicForShopService({
                product_shop: req.shop._id,
                ...req.query
            })
        }).send(res)
    }

    getALlProductByShop = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get all product success',
            metadata: await getAllProductForShopService({
                product_shop: req.shop._id,
                ...req.query
            })
        }).send(res)
    }

    updateSku = async(req, res, next) => {
        new SuccessResponse({
            message: 'Update sku successfuly',
            metadata: await updateOneSkuService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    updateListSku = async(req, res, next) => {
        new SuccessResponse({
            message: 'Update list sku successfuly',
            metadata: await updateListSkuService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    publishSku = async(req, res, next) => {
        new SuccessResponse({
            message: 'Publish sku successfully',
            metadata: await publishSkuService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    unPublishSku = async(req, res, next) => {
        new SuccessResponse({
            message: 'Un publish sku successfully',
            metadata: await unPublishSkuService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    deleteProductVariation = async(req, res, next) => {
        new SuccessResponse({
            message: 'Delete product variation successfully',
            metadata: await deleteProductVariationService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    addProductVariation = async(req, res, next) => {
        new SuccessResponse({
            message: 'Add product variation successfully',
            metadata: await addProductVariationService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    setDefaultSku = async(req, res, next) => {
        new SuccessResponse({
            message: 'Set default sku successfully',
            metadata: await setDefaultSkuService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    unsetDefaultSku = async(req, res, next) => {
        new SuccessResponse({
            message: 'Unset default sku successfully',
            metadata: await unsetDefaultSkuService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    createOneSKu = async(req, res, next) => {
        new SuccessResponse({
            message: 'Create one sku successfully',
            metadata: await createOneSkuService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    createListSKu = async(req, res, next) => {
        new SuccessResponse({
            message: 'Create list sku successfully',
            metadata: await createListSkuService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    updateVariationOptions = async(req, res, next) => {
        new SuccessResponse({
            message: 'Update variation options successfully',
            metadata: await updateVariationOptionsService({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }

    getOneSpuDetail = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await getOneSpuDetailByShopService({
                shopId: req.shop._id,
                spuId: req.params.spuId
            })
        }).send(res)
    }

    testNhe = async(req, res, next) => {
        new SuccessResponse({
            message: 'Test thanh cong roi nhe',
            metadata: await testNhe({
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }
}

module.exports = new ProductController()