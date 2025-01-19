'use strict'

const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { BadRequestError } = require('../core/error.response')
const { findUserByEmail, createUser } = require("../models/repositories/user.repo")
const { sendEmailToken, sendEmailConfirmToken } = require('./email.service')
const { findOtpByTokenService, deleteOtpService } = require('./otp.service')
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { CACHE_KEYSTORE } = require('../auth/constant')
const {setCacheExpiration} = require('../models/repositories/cache.repo')
const { createKeyToken } = require('./keytoken.service')


const newUserService = async ({
    email
}) => {
    const foundUser = await findUserByEmail(email)
    if(foundUser) 
        throw BadRequestError('Email already exists')

    const result = await sendEmailConfirmToken({
        email
    })

    return {
        message: 'Email has been sent!',
        metadata: result
    }
}
// const checkUserToken = async ({
//     token
// }) => {
//     const { otp_token, otp_email: email } = await findOtpByTokenService({ token})

//     if(!email)
//         throw new BadRequestError('Email token not found')
    
//     const foundUser = await findUserByEmail(email)
//     if(foundUser)
//         throw new BadRequestError('Email already exists')
//     deleteTokenService(otp_token)
//     const passwordHash = await bcrypt.hash(email, 10)

//     const user = await insertUser({
//         email,
//         passwordHash
//     })
//     if(!user)
//         throw new BadRequestError('Something went wrong! pls retry')
//     return {
//         message: 'Create user success',
//         metadata: user
//     }
// }

const sigupUser = async ({
    token,
    username,
    password
}) => {
    const otp = await findOtpByTokenService({ token})
    if(!otp)
        throw new BadRequestError('Email token not be found')
    const { otp_token, otp_email: email} = otp
    
    const foundUser = await findUserByEmail(email)
    if(foundUser) throw new BadRequestError('Email already exists')
    
    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = await createUser({
        username,
        email,
        passwordHash
    })
    if(!newUser)
        throw new BadRequestError('Something went wrong! Pls retry')

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });
    
    const keyTokens = await createTokenPair(
        { payload: { userId: newUser._id, role: newUser.usr_role, email: newUser.usr_email } },
        privateKey,
        publicKey
    );
    if(!keyTokens) throw new BadRequestError('Generator token failure')
    
    const privateKeyBase64 = privateKey.export({ type: 'pkcs1', format: 'der' }).toString('base64');
    const publicKeyBase64 = publicKey.export({ type: 'pkcs1', format: 'der' }).toString('base64');

    const newKeyToken = createKeyToken({
        userId: newUser._id,
        privateKey: privateKeyBase64,
        publicKey: publicKeyBase64,    
        refreshToken: keyTokens.refreshToken
    })
    if(!newKeyToken) throw new BadRequestError('Create new token error')
    //delete otp in DB
    deleteOtpService({ token })
    
    //set refresh token cache
    const refreshTokenCache = `${CACHE_KEYSTORE.REFRESH_TOKEN}${newUser._id}`;  
    setCacheExpiration({
        key: refreshTokenCache,
        value: keyTokens.refreshToken,
        expiration: 60 * 60 * 24 * 30 //1 month 
    })

    return {
        user: getInfoData({ 
            fields: ['_id', 'usr_name', 'usr_email', 'usr_role'], object: newUser
        }),
        keyTokens
    }
}
module.exports = {
    newUserService,
    sigupUser
}