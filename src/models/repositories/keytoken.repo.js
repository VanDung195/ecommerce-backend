'use strict'

const KEYTOKEN = require('../../models/keytoken.model')
const { convertToObjectIdMongodb } = require('../../utils/index')

const createKeyToken = async ({
    userId,
    privateKey,
    publicKey,
    refreshToken
}) => {
    try {
        const filter = { userId: userId },
            update = {
                privateKey: privateKey,
                publicKey: publicKey,
                refreshToken: refreshToken,
                refreshTokenUsed: []
            }, options = { upsert: true, new: true }
        const tokens = await KEYTOKEN.findOneAndUpdate(filter, update, options)
        return tokens
    } catch (error) {
        return error
    }
}

const deleteKeyById = async ({
    userId
}) => {
    try {
        return await KEYTOKEN.deleteOne({
            userId: userId
        })
    } catch (error) {
        return error
    }
}

const updateRefreshTokenUsed = async ({
    userId,
    refreshTokenOld,
    refreshTokenNew
}) => {
    const filter = { userId: convertToObjectIdMongodb(userId)}
    const update = {
        $set: {
            refreshToken: refreshTokenNew
        },
        $addToSet: {
            refreshTokenUsed: refreshTokenOld
        }
    }

    const result = await KEYTOKEN.updateOne(filter, update)

    return result
}

const deleteKeyByUserId = async () => {

}

const findKeyTokenByUserId = async ({ userId }) => {
    const objectId = convertToObjectIdMongodb(userId);
    const keyStore = await KEYTOKEN.findOne({ userId: objectId });
    return keyStore;
}


module.exports = {
    createKeyToken,
    deleteKeyById,
    deleteKeyByUserId,
    findKeyTokenByUserId,
    updateRefreshTokenUsed
}