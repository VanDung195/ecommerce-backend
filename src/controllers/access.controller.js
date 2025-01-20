'use strict'

const { SuccessResponse } = require("../core/success.response")
const {handlerRefreshToken} = require('../services/access.service')
const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

class AccessController{
    handlerRefreshToken = async(req, res, next) => {
        new SuccessResponse({
            message: 'Refresh token success',
            metadata: await handlerRefreshToken({
                userIdHeader: req.headers[HEADER.CLIENT_ID]
            }) 
        }).send(res)
    }
}

module.exports = new AccessController()