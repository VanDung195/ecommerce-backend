'use strict'

const { SuccessResponse } = require("../core/success.response")
const { getOneAffiliateLinkByAffIdAndProductId } = require("../models/repositories/affiliateLink.repo")
const { verifyAffiliateService, rejectAffiliateService, redirectToDestinationUrlService, handlerDestinationUrlService, processAffiliatePayoutsService } = require("../services/affiliate.service")
const { createPartnerAffiliateService } = require("../services/partnerAffiliate.service")
const { createSellerAfiiliateService, createAffiliateLinkBySellerService } = require("../services/sellerAffiliate.service")
const { getLastestAffiliateCookie, convertToObjectIdMongodb } = require("../utils")

class AffiliateController{
    //seller affiliate
    newSellerAffiliate = async(req, res, next) => {
        new SuccessResponse({
            message: 'Created seller affiliate',
            metadata: await createSellerAfiiliateService({
                userId: req.user.userId,
                shopId: req.shop._id,
                ...req.body
            })
        }).send(res)
    }
    createAffiliateLinkBySeller = async(req, res, next) => {
        new SuccessResponse({
            message: 'Create affiliate link success',
            metadata: await createAffiliateLinkBySellerService({
                shopId: req.affiliate.shopId,
                affiliateId: req.affiliate._id,
                productId: req.body.productId
            })
        }).send(res)
    }
    //end seller affiliate

    //partner affiliate (KOL, KOC, OTHER)
    newPartnerAffiliate = async(req, res, next) => {
        new SuccessResponse({
            message: 'Created partner affiliate',
            metadata: await createPartnerAffiliateService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    } 
    //end partner affiliate

    verifyAffiliate = async(req, res, next) => {
        new SuccessResponse({
            message: 'Affiliate verified',
            metadata: await verifyAffiliateService(req.params)
        }).send(res)
    }

    rejectAffiliate = async(req, res, next) => {
        new SuccessResponse({
            message: 'Affiliate rejected',
            metadata: await rejectAffiliateService(req.params.affiliateId)
        }).send(res)
    }

    recordClick = async(req, res, next) => {
        const ipAddress = req.header('x-forwarded-for') || req.connection.remoteAddress
        const userAgent = req.headers['user-agent']
        new SuccessResponse({
            message: 'Success',
            metadata: await recordClickService({
                ipAddress,
                userAgent
            })
        }).send(res)
    }

    redirectToDestinationUrl = async(req, res, next) => {
        console.log(req.cookies)
        const affiliateCookies = getLastestAffiliateCookie(req.cookies)
        console.log(affiliateCookies)
        new SuccessResponse({
            message: 'Success',
            metadata: await redirectToDestinationUrlService(req.params.shortUrl) 
        }).send(res)
    }

    handlerDestinationUrl = async(req, res, next) => {
        const ipAddress = req.header('x-forwarded-for') || req.connection.remoteAddress
        const userAgent = req.headers['user-agent']
        const result = await handlerDestinationUrlService({
            product_slug: req.params.slug,
            type: req.query.type,
            affiliateId: req.query.source,
            ip_address: ipAddress,
            user_agent: userAgent,
            country: 'VietNam',
            device_type: 'desktop',
            browser: 'Chrome'
        })
        const affiliateId = req.query.source.split('_')[1]
        const foundAffiliateLink = await getOneAffiliateLinkByAffIdAndProductId({ affiliateId: convertToObjectIdMongodb(affiliateId), productId: result._id})
        const now = Date.now()
        res.cookie(`affiliate_${result._id.toString()}`, `${req.query.source}_${foundAffiliateLink._id.toString()}_${now}`, { //_id is productId
            // path: '/api/order/checkout',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'Lax'
        })
        new SuccessResponse({
            message: 'Success',
            metadata: result
        }).send(res)
    }

    processAffiliatePayouts = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await processAffiliatePayoutsService()
        }).send(res)
    }
}

module.exports = new AffiliateController()