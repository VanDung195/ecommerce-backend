'use strict'

const { SuccessResponse } = require('../core/success.response')
const { createSpuService, getOneSpuService } = require('../services/spu.service')

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
            metadata: await getOneSpuService({
                userId: req.user.userId,
                ...req.params
            })
        }).send(res)
    }
}

module.exports = new SpuController()