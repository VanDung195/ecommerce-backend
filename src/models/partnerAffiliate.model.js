'use strict'

const { Schema, model, Types } = require('mongoose');

const DOCUMENT_NAME = 'PartnerAffiliate'
const COLLECTION_NAME = 'PartnerAffiliates'

var partnerAffiliateSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'Users', required: true },
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

module.exports = model(DOCUMENT_NAME, partnerAffiliateSchema);