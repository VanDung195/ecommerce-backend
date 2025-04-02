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

const completeAffiliateConversion = async({
    orderId
}) => {
    const filter = {
        orderId
    }, update = {
        $set: {
            status: 'complete',
            completedAt: new Date()
        }
    }, option = { new: true }
    return AFFILIATE_CONVERSION.findOneAndUpdate(filter, update, option)
}

const cancelAffiliateConversion = async({
    orderId
}) => {
    const filter = {
        orderId
    }, update = {
        $set: {
            status: 'cancelled'
        }
    }, option = { new: true }
    return AFFILIATE_CONVERSION.findOneAndUpdate(filter, update, option)
}

const getEligibleConversions = async(cutoffDate) => {
    return AFFILIATE_CONVERSION.find({
        status: 'complete',
        createdAt: {
            $lte: cutoffDate
        },
        convertedAt: null
    })
}

const markAsConverted = async({ conversionId, affiliateId, affiliateType }) => {
    const filter = {
        _id: conversionId,
        affiliateId,
        affiliateType
    }, update = {
        convertedAt: new Date()
    }, option = { new: true }
    return AFFILIATE_CONVERSION.findOneAndUpdate(filter, update, option)
}

module.exports = {
    createAffiliateConversion,
    getEligibleConversions,
    markAsConverted,
    completeAffiliateConversion,
    cancelAffiliateConversion
}