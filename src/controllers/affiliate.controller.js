'use strict'

const { SuccessResponse } = require("../core/success.response")
const { createAffiliateService, verifyAffiliateService, rejectAffiliateService, recordClickService } = require("../services/affiliate.service")
const { createPartnerAffiliateService } = require("../services/partnerAffiliate.service")
const { createSellerAfiiliateService, createAffiliateLinkBySellerService } = require("../services/sellerAffiliate.service")

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
                userId: req.user.userId,
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
}

module.exports = new AffiliateController()