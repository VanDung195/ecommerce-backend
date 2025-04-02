'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const SELLER_AFFILIATE = require('../sellerAffiliate.model')

const createSellerAffiliate = async({ userId, shopId, social_media = [] }) => {
    return await SELLER_AFFILIATE.create({
        userId,
        shopId,
        social_media
    })
}

const getOneSellerAffiliateByUserId = async(userId) => {
    return await SELLER_AFFILIATE.findOne({
        userId
    })
}

const getOneSellerAffiliateById = async(affiliateId) => {
    return await SELLER_AFFILIATE.findOne({
        _id: convertToObjectIdMongodb(affiliateId)
    })
}

const addCommissionToSellerAffiliateBalance = async({ affiliateId, balance }) => {
    const filter = {
        _id: affiliateId,
    }, update = {
        $inc: {
            balance
        }
    }, option = { new: true, assert: true }
    return SELLER_AFFILIATE.findOneAndUpdate(filter, update, option)
}
module.exports = {
    createSellerAffiliate,
    getOneSellerAffiliateByUserId,
    getOneSellerAffiliateById,
    addCommissionToSellerAffiliateBalance
}