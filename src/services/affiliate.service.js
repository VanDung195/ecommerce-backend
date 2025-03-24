'use strict'

const { v4: uuidv4 } = require('uuid')
const { BadRequestError, NotFoundError } = require("../core/error.response")
const { createAffiliate, getOneAffiliateById, verifyAffiliate, rejectAffiliate } = require("../models/repositories/affiliate.repo")


//user
const createAffiliateService = async({ userId, social_media = [] }) => {
    const affiliate = await createAffiliate({ userId, social_media})
    if(!affiliate)
        throw new BadRequestError('Create affiliate failed')
    return affiliate
}
//end user

const recordClickService = ({ affiliateLinkId = '1', ipAddress, userAgent = '' }) => {
    if(ipAddress === '::1'){ //IPv6 to IPv4
        ipAddress = '172.0.0.1'
    }
    console.log(userAgent)
    return uuidv4()
}

//admin
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
    recordClickService
}