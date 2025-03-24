'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const AFFILIATE = require('../affiliate.model')


const getOneAffiliateById = async(affiliateId) => {
    return await AFFILIATE.findOne({
        _id: convertToObjectIdMongodb(affiliateId)
    })
}

const createAffiliate = async({ userId, social_media }) => {
    return await AFFILIATE.create({ userId, social_media })
}

//admin
const verifyAffiliate = async(affiliateId) => {
    const filter = {
        _id: convertToObjectIdMongodb(affiliateId)
    }, update = {
        $set: {
            status: 'active',
            verified: true
        }
    }, option = { new: true }
    return await AFFILIATE.findOneAndUpdate(filter, update, option)
}

const rejectAffiliate = async(affiliateId) => {
    const filter = {
        _id: convertToObjectIdMongodb(affiliateId)
    }, update = {
        $set: {
            status: 'rejected',
        }
    }, option = { new: true }
    return await AFFILIATE.findOneAndUpdate(filter, update, option)
}

module.exports = {
    getOneAffiliateById,
    createAffiliate,
    verifyAffiliate,
    rejectAffiliate
}