'use strict'

const { Schema, Types, model } = require('mongoose'); 

const DOCUMENT_NAME = 'AffiliateConversion'
const COLLECTION_NAME = 'AffiliateConversions'

var affiliateConversionSchema = new Schema({
    affiliate_link: { type: Types.ObjectId, ref: 'AffiliateLinks', required: true },
    click: { type: Types.ObjectId, ref: 'AffiliateClicks', required: true },
    order: { type: Types.ObjectId, ref: 'Orders', required: true },
    shop: { type: Types.ObjectId, ref: 'Shops', required: true },
    conversion_date: { type: Types.ObjectId, default: () => new Date() },
    order_value: { type: Number },
    commission_amount: { type: Number, required: true },
    isSelfAffiliate: { type: Boolean, default: false },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, affiliateConversionSchema);