'use strict'

const { SuccessResponse } = require('../core/success.response')
const { updateSkuService, updateOneSkuService, updateListSkuService } = require('../services/sku.service')
const { createSpuService, getOneSpuService, getListSkuBySpuIdService, getOneSkuService, getAllSpuService, publishProductByShopService, unPublishProductByShopService, getAllDraftsForShopService, getAllPublicForShopService, getAllProductForShopService } = require('../services/spu.service')

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
}

module.exports = new ProductController()