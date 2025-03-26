'use strict'

const AFFILIATE_LINK = require('../affiliateLink.model')

const createAffiliateLink = async({ affiliateId, productId, destination_url, short_url }) => {
    return await AFFILIATE_LINK.create({
        affiliateId,
        productId,
        destination_url,
        short_url
    })
}


module.exports = {
    createAffiliateLink
}