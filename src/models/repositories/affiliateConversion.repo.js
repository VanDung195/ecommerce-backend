'use strict'

const AFFILIATE_CONVERSION = require('../affiliateConversion.model')

const createAffiliateConversion = async({
    affiliateId,
    affiliate_type,
    affiliate_linkId,
    orderId,
    product_value,
    commission_rate,
    commission_amount
}) => {
    return AFFILIATE_CONVERSION.create({
        affiliateId,
        affiliate_type,
        affiliate_linkId,
        orderId,
        product_value,
        commission_rate,
        commission_amount
    })
}

const updateAffiliateConversationStatus = async({
    orderId,
    newStatus,
}) => {
    const filter = {
        orderId
    }, update = {
        $set: {
            status: newStatus
        }
    }, option = { new: true }
    return AFFILIATE_CONVERSION.findOneAndUpdate(filter, update, option)
}

const getEligibleConversions = async(cutoffDate) => {
    return AFFILIATE_CONVERSION.find({
        status: 'complete',
        createdAt: {
            $lte: cutoffDate
        }
    })
}

module.exports = {
    createAffiliateConversion,
    updateAffiliateConversationStatus,
    getEligibleConversions
}