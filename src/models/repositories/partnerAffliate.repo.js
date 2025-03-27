'use strict'

const PARTNER_AFFILIATE = require('../partnerAffiliate.model')

const createPartnerAffiliate = async({ userId, social_media = [] }) => {
    return await PARTNER_AFFILIATE.create({
        userId,
        social_media
    })
}

module.exports = {
    createPartnerAffiliate
}