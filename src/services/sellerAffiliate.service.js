'use strict'

const mongoose = require("mongoose")
const { BadRequestError, NotFoundError } = require("../core/error.response")
const { createSellerAffiliate } = require("../models/repositories/sellerAffiliate.repo")
const { findShopByUserId } = require("../models/repositories/shop.repo")
const { addRole } = require("../models/repositories/user.repo")
const { encodeBase62 } = require("../utils")
const { getOneAffiliateLinkByShortUrl, createAffiliateLink } = require("../models/repositories/affiliateLink.repo")
const { getOneSpuById } = require("../models/repositories/spu.repo")

const createSellerAfiiliateService = async({ userId, shopId, social_media = []}) => {
    const sellerAffiliate = await createSellerAffiliate({ userId, shopId, social_media })
    if(!sellerAffiliate)
        throw new BadRequestError('Create seller affiliate failure')
    await addRole({ userId, role: 'seller_affiliate'})
    return sellerAffiliate
}

const createAffiliateLinkBySellerService = async({ shopId, affiliateId, productId }) => {
    const foundProduct = await getOneSpuById({ shop: shopId, spuId: productId })
    if(!foundProduct)
        throw new NotFoundError('Product not found')
    const productSlug = foundProduct.product_slug
    let shortUrl
    let existsShortUrl = true
    const maxAttempts = 5
    let attempt = 0
    while(existsShortUrl && attempt < maxAttempts){
        attempt++
        const affiliateLinkObjectId = new mongoose.Types.ObjectId()
        const uniqueString = affiliateLinkObjectId.toString().slice(0, 8) + affiliateLinkObjectId.toString().slice(-4)
        shortUrl += encodeBase62(parseInt(uniqueString, 16))
        const randomSuffix = Math.random().toString(36).slice(-2)
        shortUrl += randomSuffix

        existsShortUrl = await getOneAffiliateLinkByShortUrl(shortUrl)
    }
    if(existsShortUrl)
        throw new BadRequestError('Failed to generate short url after multiple attempts')
    const destinationUrl = `${productSlug}?type=affiliates&&source=sl_${affiliateId}`
    const newAffiliateLink = await createAffiliateLink({ affiliateId, productId, destination_url: destinationUrl, short_url: shortUrl })
    if(!newAffiliateLink)
        throw new BadRequestError('Failed to create affiliate link')
    return newAffiliateLink
}

const redirectToDestinationUrlService = async(short_url) => {
    const affiliateLink = await getOneAffiliateLinkByShortUrl(short_url)
    if(!affiliateLink)
        throw new NotFoundError('Affiliate link not found')
    return affiliateLink.destination_url
}

const handlerDestinationUrlService = async({ product_slug, type, affiliateId }) => {
    const affPrefix = affiliateId.split('_')[0] //affiliate type
    const affSuffix = affiliateId.split('_')[1] //affilaiteId
    return {
        affPrefix,
        affSuffix
    }
}

module.exports = {
    createSellerAfiiliateService,
    createAffiliateLinkBySellerService,
    redirectToDestinationUrlService,
    handlerDestinationUrlService
}