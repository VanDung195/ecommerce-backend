'use strict'

const { SuccessResponse } = require("../core/success.response")
const { createAffiliateService, verifyAffiliateService, rejectAffiliateService, recordClickService } = require("../services/affiliate.service")

class AffiliateController{
    newAffiliate = async(req, res, next) => {
        new SuccessResponse({
            message: 'Success',
            metadata: await createAffiliateService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

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