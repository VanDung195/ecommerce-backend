'use strict'

const { Schema, Types, model } = require('mongoose'); 

const DOCUMENT_NAME = 'AffiliateConversion'
const COLLECTION_NAME = 'AffiliateConversions'

var affiliateConversionSchema = new Schema({
    affiliate_link: { type: Types.ObjectId, ref: 'AffiliateLinks', required: true },
    orderId: { type: Types.ObjectId, ref: 'Orders', required: true },
    shopId: { type: Types.ObjectId, ref: 'Shops', required: true },
    conversion_date: { type: Date, default: () => new Date() },
    order_value: { type: Number },
    commission_amount: { type: Number, required: true },
    // isSelfAffiliate: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'complete', 'cancelled'], default: 'pending'}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, affiliateConversionSchema);