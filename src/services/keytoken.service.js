'use strict'

const { Types } = require('mongoose')
const { findKeyTokenByUserId, createKeyToken } = require('../models/repositories/keytoken.repo')
const { NotFoundError, BadRequestError } = require('../core/error.response')
const { convertToObjectIdMongodb } = require('../utils/index')
class KeyTokenService{
    createKeyToken = async ({ userId, privateKey, publicKey, refreshToken }) => {
        const keys = createKeyToken({
            userId,
            privateKey,
            publicKey,
            refreshToken
        })
        if(!keys) throw new BadRequestError('Create key failure')

        return keys
    }

    findKeyTokenByUserId = async ({
        userId
    }) => {
        const keyStore = await findKeyTokenByUserId({
            userId
        })
        if(!keyStore) throw new NotFoundError('Key token not found');

        return keyStore
    }
}

module.exports = new KeyTokenService()