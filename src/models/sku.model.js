'use strict'

const { Schema, Types, model} = require('mongoose'); // Erase if already required
const slugify = require('slugify')

const COLLECTION_NAME = 'Skus'
const DOCUMENT_NAME = 'Sku'

var skuSchema = new Schema({
    skuId: { type: String, required: true, unique: true},
    sku_tier_idx: { type: Array, default: [0]},
    sku_default: { type: Boolean, default: false},
    sku_slug: { type: String, default: ''},
    sku_price: { type: String, required: true},
    sku_stock: { type: Number, required: true},
    productId: { type: Schema.Types.ObjectId, ref: 'Spu'},
    isDraft: { type: Boolean, default: true, index: true, select: false},
    isPublished: { type: Boolean, default: false, index: true, select: false},
    isDeleted: { type: Boolean, default: false}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, skuSchema);