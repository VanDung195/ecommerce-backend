'use strict'

const { Schema, model, Types } = require('mongoose');

const DOCUMENT_NAME = 'Affiliate'
const COLLECTION_NAME = 'Affiliates'

var affiliateSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'Users', required: true },
    commision_rate: { type: Number, default: 0.2}, //tỷ lệ hoa hồng
    balance: { type: Types.Decimal128, default: 0.0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, affiliateSchema);