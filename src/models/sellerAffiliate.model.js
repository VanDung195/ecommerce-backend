'use strict'

const { Schema, model, Types } = require('mongoose');

const DOCUMENT_NAME = 'SellerAffiliate'
const COLLECTION_NAME = 'SellerAffiliates'

var sellerAffiliateSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'Users', required: true },
    shopId: { type: Types.ObjectId, ref: 'Shops', required: true },
    balance: { type: Number, default: 0.0 },
    pending_balance: { type: Number, default: 0.0 },
    status: { type: String, enum: ['pending', 'active', 'inactive', 'rejected', 'deleted', 'banned'], default: 'pending' },
    verified: { type: Boolean, default: false },
    social_media: { type: [{
        platform: { type: String, enum: ['Facebook', 'Instagram', 'Thread', 'Youtube', 'Tiktok'], required: true },
        link: { type: String, required: true }
    }], required: true },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, sellerAffiliateSchema);