'use strict'

const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { NotFoundError, BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findUserByEmail } = require("../models/repositories/user.repo")
const { createTokenPair } = require('../auth/authUtils')
const { createKeyToken, findKeyTokenByUserId, updateRefreshTokenUsed } = require('../models/repositories/keytoken.repo')
const { CACHE_KEYSTORE } = require('../configs/constant')
const { setCacheExpiration, getCache } = require('../models/repositories/cache.repo')
const { getInfoData, convertToObjectIdMongodb } = require('../utils')
const JWT = require('jsonwebtoken')

const login = async ({
    email,
    password
}) => {
    const foundUser = await findUserByEmail(email)
    if(!foundUser) throw new BadRequestError('User not register')
    
    const match = bcrypt.compare(password, foundUser.usr_password)
    if(!match) throw new AuthFailureError('Authentication error')

    const { privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    })

    const keyTokens = await createTokenPair(
        {payload: { userId: foundUser._id, role: foundUser.usr_role, email: foundUser.usr_email}},
        privateKey,
        publicKey
    )
    if(!keyTokens) throw new BadRequestError('Generator token failure')

    const privateKeyPem = privateKey.export({ type: 'pkcs1', format: 'pem' });
    const publicKeyPem = publicKey.export({ type: 'pkcs1', format: 'pem' });
    // const privateKeyBase64 = privateKey.export({ type: 'pkcs1', format: 'der' }).toString('base64');
    // const publicKeyBase64 = publicKey.export({ type: 'pkcs1', format: 'der' }).toString('base64');
    const userObjectId = await convertToObjectIdMongodb(foundUser._id)
    const newKeyToken = await createKeyToken({
        userId: userObjectId,
        privateKey: privateKeyPem,
        publicKey: publicKeyPem,
        refreshToken: keyTokens.refreshToken
    })
    console.log(newKeyToken);
    
    if(!newKeyToken) throw new BadRequestError('Create new token error')
    
    const refreshTokenCache = `${CACHE_KEYSTORE.REFRESH_TOKEN}${foundUser._id}`
    setCacheExpiration({
        key: refreshTokenCache,
        value: keyTokens.refreshToken,
        // expiration: 60 * 60 * 24 * 30
        expiration: 60 * 60 * 24 * 2
    })

    return {
        user: getInfoData({
            fields: ['_id', 'usr_name', 'usr_email', 'usr_role'], object: foundUser
        }),
        keyTokens
    }
    
}

const handlerRefreshToken = async ({
    userIdHeader
}) => {
    if(!userIdHeader) throw BadRequestError('Invalid request')
    const refreshTokenCache = `${CACHE_KEYSTORE.REFRESH_TOKEN}${userIdHeader}`
    const refreshToken = await getCache({
        key: refreshTokenCache
    })
    if(!refreshToken) {
        throw new ForbiddenError('Something went wrong! Pls relogin')
    }
    const keyStore = await findKeyTokenByUserId({
        userId: userIdHeader
    })
    if(!keyStore) throw new NotFoundError('Keystore not found')

    try {
        const decodeRefreshToken = JWT.verify(refreshToken, keyStore.publicKey, {
            algorithms: ['RS256']
        })
        if(userIdHeader != decodeRefreshToken.userId || userIdHeader != keyStore.userId) throw new AuthFailureError('Invalid user')
        
        const { userId, role, email} = decodeRefreshToken

        const newAccessToken = JWT.sign(
            { payload: { userId: userId, role: role, email: email}},
            keyStore.privateKey,
            {
                algorithm: 'RS256',
                expiresIn: '5m'
            }
        )
        return {
            accessToken: newAccessToken
        }
    } catch (error) {
        throw new AuthFailureError('Invalid or expired Refresh Token');
    }
}

const handlerRefreshTokenV2 = async ({
    userIdHeader
}) => {
    if(!userIdHeader) throw BadRequestError('Invalid request')

    const keyStore = await findKeyTokenByUserId({
        userId: userIdHeader
    })
    if(!keyStore) throw new NotFoundError('Pls relogin')

    const refreshTokenCache = `${CACHE_KEYSTORE.REFRESH_TOKEN}${userIdHeader}`
    const refreshToken = await getCache({
        key: refreshTokenCache
    })
    //refreshToken expired
    if(!refreshToken) {



        throw new ForbiddenError('Something went wrong! Pls relogin')
    }

    //refreshToken not expired
    if(refreshToken){
        try {
            const decodeRefreshToken = JWT.verify(refreshToken, keyStore.publicKey, {
                algorithms: ['RS256']
            })
            if(userIdHeader != decodeRefreshToken.userId || userIdHeader != keyStore.userId) throw new AuthFailureError('Invalid user')
            
            const { userId, role, email} = decodeRefreshToken
    
            const newAccessToken = JWT.sign(
                { payload: { userId: userId, role: role, email: email}},
                keyStore.privateKey,
                {
                    algorithm: 'RS256',
                    expiresIn: '5m'
                }
            )
            return {
                accessToken: newAccessToken
            }
        } catch (error) {
            throw new AuthFailureError('Invalid or expired Refresh Token');
        }
    }
}


module.exports = {
    login,
    handlerRefreshToken
}
