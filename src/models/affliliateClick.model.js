'use strict'

const { Schema, model, Types } = require('mongoose'); 

const DOCUMENT_NAME = 'AffiliateClick'
const COLLECTION_NAME = 'AffiliateClicks'

var affiliateClickSchema = new Schema({
    affiliate_link: { type: Types.ObjectId, ref: 'AffiliateLinks', required: true, index: true },
    clickedAt: { type: Date, default: () => new Date() },
    ip_address: {type: String, required: true },
    user_agent: { type: String, required: true }
});

module.exports = model(DOCUMENT_NAME, affiliateClickSchema);