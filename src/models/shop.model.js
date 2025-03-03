'use strict'

const { Schema, model} = require('mongoose'); 

const DOCUMENT_NAME = 'Shop'
const COLLECTION_NAME = 'Shops'

var shopSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true},
    shop_name: { type: String, required: true},
    shop_email: { type: String, required: true},
    shop_address: { type: String, required: true},
    shop_phone: { type: String, required: true},
    shop_logo: { type: String, default: ''},
    shop_status: { type: String, default: 'active', enum: ['active', 'inactive']},
    shop_verify: { type: Boolean, default: false},
    shop_description: { type: String, default: ''},
    shop_type: { type: String, default: 'individual', enum: ['individual', 'corporate']},
    shop_ratings: { type: Number, default: 0},
}, { 
   timestamps: true,
   collection: COLLECTION_NAME 
});

module.exports = model(DOCUMENT_NAME, shopSchema);