'use strict'

const { Schema, model, Types } = require('mongoose'); 

const DOCUMENT_NAME = 'AffiliateClick'
const COLLECTION_NAME = 'AffiliateClicks'

var affiliateClickSchema = new Schema({
    affiliate_link: { type: Types.ObjectId, ref: 'AffiliateLinks', required: true, index: true },
    ip_address: {type: String, required: true },
    user_agent: { type: String, required: true },
    country: { type: String, required: true },
    device_type: { type: String, required: true },
    browser: { type: String, required: true },
    clickedAt: { type: Date, default: () => new Date() }
}, {
    timestamps: false,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, affiliateClickSchema);