'use strict'
const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError, ForbiddenError, BadRequestError } = require('../core/error.response')
const { getCache } = require('../models/repositories/cache.repo')
const { deleteKeyById, findKeyTokenByUserId } = require('../models/repositories/keytoken.repo')
const { CACHE_KEYSTORE } = require('../configs/constant')

const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid request')
    const keyStore = await findKeyTokenByUserId({
        userId
    })
    if(!keyStore) throw new NotFoundError('Keystore not found')
    if(req.url === '/handler_refresh_token') {
        const refreshTokenCache = `${CACHE_KEYSTORE.REFRESH_TOKEN}${userId}`
        const refreshToken = await getCache({ key: refreshTokenCache })
        // if(!refreshToken) throw new AuthFailureError('Something went wrong! Pls relogin')
        if(!refreshToken) return next()
        try {
            const decodeUser = JWT.verify(refreshToken, keyStore.publicKey, { algorithms: 'RS256'})
            if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid user1')
            if(userId !== keyStore.userId.toString()) throw new AuthFailureError('Invalid user2')
            
            req.keyStore = keyStore
            req.user = decodeUser
            return next()
        } catch (error) {
            throw new AuthFailureError(`Invalid or expired token::::${error.message}`);
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new NotFoundError('Invalid keystore')

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey, { algorithms: ['RS256'] });
        
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid user1')
        
        if(userId !== keyStore.userId.toString()) throw new AuthFailureError('Invalid user2')
        
        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            throw new AuthFailureError('Access token expired. Please refresh token')
        }
        throw new AuthFailureError(`Invalid or expired token::::${error.message}`);
    }
})


const createTokenPair = ({ payload }, privateKey, publicKey) => {
    try {
        const accessToken = JWT.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1 days'
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