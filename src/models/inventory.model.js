'use strict'

const { Schema, model} = require('mongoose'); 

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

var inventorySchema = new Schema({
    inven_productId: { type: String, ref: 'Sku', required: true, unique: true},
    inven_stock: { type: Number, required: true, min: 0},
    inven_shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true},
    inven_sold: { type: Number, default: 0},
    inven_status: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'instock'},
    inven_reservations: {type: Array, default: []},
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, inventorySchema);