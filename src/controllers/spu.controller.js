'use strict'

const { SuccessResponse } = require('../core/success.response')
const { createSpuService } = require('../services/spu.service')

class SpuController {
    newSpu = async(req, res, next) => {
        const user = req.user
        new SuccessResponse({
            message: 'Create spu success',
            metadata: await createSpuService(req.body)
        }).send(res)
    }
}

module.exports = new SpuController()