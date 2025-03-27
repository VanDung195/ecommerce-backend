'use strict'

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

module.exports = {
    createSellerAffiliate,
    getOneSellerAffiliateByUserId
}