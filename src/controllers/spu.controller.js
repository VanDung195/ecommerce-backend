'use strict'

const { SuccessResponse } = require('../core/success.response')
const { createSpuService, getOneSpuService, getListSkuBySpuIdService, getOneSkuService, getAllSpuService, publishProductByShopService, unPublishProductByShopService } = require('../services/spu.service')

class SpuController {
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
}

module.exports = new SpuController()