'use strict'

const { Schema, Types, model} = require('mongoose'); // Erase if already required
const slugify = require('slugify');
// const { updateInvenStockSpuService } = require('../services/spu.service');

const COLLECTION_NAME = 'Skus'
const DOCUMENT_NAME = 'Sku'

var skuSchema = new Schema({
    skuId: { type: String, required: true, unique: true},
    sku_tier_idx: { type: Array, default: [0]},
    sku_default: { type: Boolean, default: false},
    sku_slug: { type: String, default: ''},
    sku_price: { type: Number, required: true, min: 1000},
    sku_stock: { type: Number, required: true, min: 1},
    productId: { type: Schema.Types.ObjectId, ref: 'Spu'},
    isDraft: { type: Boolean, default: true, index: true, select: false},
    isPublished: { type: Boolean, default: false, index: true, select: false},
    isDeleted: { type: Boolean, default: false}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

// skuSchema.post('save', async(next) => {
//     if(!this.isModified('sku_price')){
//         try {
//             //update min price and max price value of spuSchema
//             const result = await updateInvenStockSpuService(this.productId)
//             return next()
//         } catch (error) {
//             return next(error)
//         }
//     }
//     if(!this.isModified('sku_stock')){
//         //update total stock value of spuSchema
//         return next()
//     }
// })

module.exports = model(DOCUMENT_NAME, skuSchema);