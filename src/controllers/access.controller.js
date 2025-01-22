'use strict'

const { SuccessResponse } = require("../core/success.response")
const { handlerRefreshTokenV2, logout, login } = require('../services/access.service')
const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

class AccessController{
    login = async (req, res, next) => {
        new SuccessResponse({
            message: 'Login successfuly',
            metadata: await login(req.body)
        }).send(res)
    }

    handlerRefreshToken = async(req, res, next) => {
        new SuccessResponse({
            message: 'Refresh token success',
            metadata: await handlerRefreshTokenV2({
                userIdHeader: req.headers[HEADER.CLIENT_ID]
            }) 
        }).send(res)
    }

    logout = async(req, res, next) => {
        new SuccessResponse({
            message: 'Logout',
            metadata: await logout({
                keyStore: req.keyStore
            })
        }).send(res)
    }
}

module.exports = new AccessController()