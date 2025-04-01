'use strict'

const { Schema, model, Types } = require('mongoose'); 

const DOCUMENT_NAME = 'AffiliateLink'
const COLLECTION_NAME = 'AffiliateLinks'

var affiliateLinkSchema = new Schema({
    affiliateId: { type: Types.ObjectId, ref: 'Affiliates', required: true, index: true },
    affiliate_type: { type: String, enum: ['seller', 'partner'], required: true },
    productId: { type: Types.ObjectId, ref: 'Spus', required: true },
    destination_url: { type: String, required: true, index: true },
    short_url: { type: String, required: true, index: true },
    click_count: { type: Number, default: 0},
    conversion_count: { type: Number, default: 0},
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, affiliateLinkSchema);