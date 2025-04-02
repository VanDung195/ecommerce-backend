'use strict'

const { v4: uuidv4 } = require('uuid')
const { BadRequestError, NotFoundError } = require("../core/error.response")
const { createAffiliate, getOneAffiliateById, verifyAffiliate, rejectAffiliate } = require("../models/repositories/affiliate.repo")
const { getCache, setCacheExpiration } = require('../models/repositories/cache.repo')
const { addRole } = require('../models/repositories/user.repo')
const { getOneAffiliateLinkByShortUrl, getOneAffiliateLinkByAffIdAndProductId, incrementClickCount } = require('../models/repositories/affiliateLink.repo')
const { getOneSellerAffiliateById, addCommissionToSellerAffiliateBalance } = require('../models/repositories/sellerAffiliate.repo')
const { getOneSpuBySlug, getOneSpuDetailForCustomer } = require('../models/repositories/spu.repo')
const { AFFILIATE } = require('../configs/constant')
const { recordClick } = require('../models/repositories/affiliateClick.repo')
const { getEligibleConversions, markAsConverted } = require('../models/repositories/affiliateConversion.repo')
const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const encodeBase62 = (num) => {
    let result = '';
    while (num > 0) {
        result = characters[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result || '0';
}

const createAffiliateService = async({ userId, social_media = [], type }) => {
    const affiliate = await createAffiliate({ userId, social_media, type })
    if(!affiliate)
        throw new BadRequestError('Create affiliate failed')
    await addRole({ userId, role: 'affiliate'})
    return affiliate
}

const redirectToDestinationUrlService = async(short_url) => {
    const affiliateLink = await getOneAffiliateLinkByShortUrl(short_url)
    if(!affiliateLink)
        throw new NotFoundError('Affiliate link not found')
    //set cookie để tiếp thị gián tiếp?
    return affiliateLink.destination_url
}

const handlerDestinationUrlService = async({ product_slug, type ,affiliateId, ip_address, user_agent, country, device_type, browser }) => {
    if(type !== 'affiliates')
        throw new BadRequestError('Bad request')
    const [affPrefix, affSuffix] = affiliateId.split('_'); //affiliate type and affiliateId
    if (!affPrefix || !affSuffix) 
        throw new BadRequestError('Invalid request')
    let foundAffiliate = null
    if(affPrefix === 'sl'){ //sl is seller affiliate
        foundAffiliate = await getOneSellerAffiliateById(affSuffix)
    } else if(affPrefix === 'pa') { //pa is partner affiliate (KOL, KOC, ...)
        //getOnePartnerAffiliate
    } else {
        throw new BadRequestError('Unknow affiliate type')
    }
    if(!foundAffiliate)
        throw new NotFoundError('Affiliate not found')
    const foundProduct = await getOneSpuBySlug(product_slug)
    if(!foundProduct)
        throw new NotFoundError('Product not found')
    const foundAffiliateLink = await getOneAffiliateLinkByAffIdAndProductId({ affiliateId: foundAffiliate._id, productId: foundProduct._id })
    if(!foundAffiliateLink)
        throw new NotFoundError('Invalid affiliate link')
    const productDetail = await getOneSpuDetailForCustomer(foundProduct._id)

    //record click and update click_count in affiliate link
    await incrementClickCount(foundAffiliate._id)
    if(ip_address === '::1')
        ip_address = '172.0.0.1'
    const affClickKey = `${AFFILIATE.AFFILIATE_CLICK}:${ip_address}_${user_agent}_${foundProduct._id.toString()}`
    const affiliateClick = await getCache({ key: affClickKey })
    if(!affiliateClick){
        console.log('Affiliate click not exists in cache')
        await setCacheExpiration({
            key: affClickKey,
            value: 'OK',
            expiration: 10
        })
        await recordClick({ 
            affiliate_link: foundAffiliateLink._id, 
            ip_address,
            user_agent,
            country,
            device_type,
            browser
        })
    }
    return productDetail[0]
}


//admin
const processAffiliatePayoutsService= async() => {
    const now = new Date()
    const cutoffDate = new Date()
    cutoffDate.setDate(now.getDate() - 30)
    const eligibleAffiliateConversions = await getEligibleConversions(cutoffDate)
    for(let affiliateConversion of eligibleAffiliateConversions){
        console.log(affiliateConversion)
        const affiliateType = affiliateConversion.affiliate_type
        const affiliateId = affiliateConversion.affiliateId
        const commissionAmount = affiliateConversion.commission_amount

        if(affiliateType === 'seller') {
            await addCommissionToSellerAffiliateBalance({ affiliateId, balance: commissionAmount })
            await markAsConverted({ conversionId: affiliateConversion._id, affiliateId, affiliateType })
        } else {
            //
        }
    }
    return eligibleAffiliateConversions
}

const getAllAffiliates = async({
    page = 1,
    limit = 30,
    type = ''
}) => {

}

const verifyAffiliateService = async({ affiliateId }) => {
    const foundAffiliate = await getOneAffiliateById(affiliateId)
    if(!foundAffiliate)
        throw new NotFoundError('Affiliate not found')
    const verifiedAffiliate = await verifyAffiliate(affiliateId)
    if(!verifiedAffiliate)
        throw new BadRequestError('Failed to verify this affiliate! Pls try again')
    return verifiedAffiliate
}

const rejectAffiliateService = async(affiliateId) => {
    const foundAffiliate = await getOneAffiliateById(affiliateId)
    if(!foundAffiliate)
        throw new NotFoundError('Affiliate not found')
    const rejectedAffiliate = await rejectAffiliate(affiliateId)
    if(!rejectedAffiliate)
        throw new BadRequestError('Failed to verify this affiliate! Pls try again')
    return rejectedAffiliate
}
//end admin

module.exports = {
    createAffiliateService,
    verifyAffiliateService,
    rejectAffiliateService,
    redirectToDestinationUrlService,
    handlerDestinationUrlService,
    processAffiliatePayoutsService
}