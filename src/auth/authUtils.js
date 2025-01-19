'use strict'
const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const KeyTokenService = require('../services/keytoken.service')


const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const authentication = asyncHandler ( async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid request')

    const keyStore = KeyTokenService.findKeyTokenByUserId({ userId })
    if(!keyStore) throw new NotFoundError('Keystore not found   ')

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new NotFoundError('Invalid keystore')

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId != decodeUser.userId) throw new AuthFailureError('Invalid user')

        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
        throw error
    }

})


const createTokenPair = ({ payload }, privateKey, publicKey) => {
    try {
        const accessToken = JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days'
        })

        const refreshToken = JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '30 days'
        })

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        return error
    }
}

module.exports = {
    authentication,
    createTokenPair
}