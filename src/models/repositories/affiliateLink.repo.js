'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const AFFILIATE_LINK = require('../affiliateLink.model')

const createAffiliateLink = async({ affiliateId, affiliate_type, productId, destination_url, short_url }) => {
    return await AFFILIATE_LINK.create({
        affiliateId,
        affiliate_type,
        productId,
        destination_url,
        short_url
    })
}

const getOneAffiliateLinkByShortUrl = async(short_url) => {
    return AFFILIATE_LINK.findOne({ short_url })
}

const getOneAffiliateLinkByAffIdAndProductId = async({ affiliateId, productId }) => {
    return AFFILIATE_LINK.findOne({
        affiliateId,
        productId
    })
}

const getOneAffiliateLink = async({ affiliateLinkId, affiliateId, productId }) => {
    return AFFILIATE_LINK.findOne({
        _id: convertToObjectIdMongodb(affiliateLinkId),
        affiliateId: convertToObjectIdMongodb(affiliateId),
        productId: convertToObjectIdMongodb(productId)
    })
}

const incrementClickCount = async(affiliateId) => {
    return AFFILIATE_LINK.findOneAndUpdate(
        { _id: affiliateId },
        { $inc: { click_count: 1 } },
        { new: true }
    )
}

module.exports = {
    createAffiliateLink,
    getOneAffiliateLinkByShortUrl,
    getOneAffiliateLinkByAffIdAndProductId,
    incrementClickCount,
    getOneAffiliateLink
}