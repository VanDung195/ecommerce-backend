'use strict'

const { Schema, Types, model } = require('mongoose'); 

const DOCUMENT_NAME = 'AffiliateConversion'
const COLLECTION_NAME = 'AffiliateConversions'

var affiliateConversionSchema = new Schema({
    affiliateId: { type: Types.ObjectId, required: true },
    affiliate_type: { type: String, enum: ['seller', 'partner'], required: true },
    affiliate_linkId: { type: Types.ObjectId, ref: 'AffiliateLinks', required: true },
    orderId: { type: Types.ObjectId, ref: 'Orders', required: true },
    conversion_date: { type: Date, default: () => new Date() },
    product_value: { type: Number, required: true, min: 0 }, 
    commission_rate: { type: Number, required: true, min: 0, max: 0.035 },
    commission_amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'complete', 'cancelled'], default: 'pending'},
    completedAt: { type: Date, default: null }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, affiliateConversionSchema);