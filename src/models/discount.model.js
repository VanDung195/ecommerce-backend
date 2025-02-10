'use strict'

const { Schema, model} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'

// Declare the Schema of the Mongo model
var discountSchema = new Schema({
    discount_name: { type: String, required: true},
    discount_description: { type: String, required: true},
    discount_type: { type: String, enum: ['fixed_amount', 'percentage']},
    discount_max_amount: {
        type: Number,
        required: function(){
            return this.discount_type === 'percentage'
        }
    },
    discount_value: { type: Number, required: true},
    discount_code: { type: String, required: true, index: true},
    discount_start_date: { type: Date, required: true},
    discount_end_date: { type: Date, required: true},
    discount_max_uses: { type: Number, required: true},
    discount_uses_count: { type: Number, default: 0}, //auto increment
    discount_user_used: { type: Array, default: []},
    discount_max_use_per_user: { type: Number, required: true},
    discount_min_order_value: { type: Number, required: true},
    discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true},
    discount_is_active: { type: Boolean, default: true, index: true},
    discount_applies_to: { type: String, enum: ['all', 'specific']},
    discount_productIds: { type: [String], ref: 'Sku',
        required: function(){
            return this.discount_applies_to === 'specific'
        }
    },
    isDeleted: { type: Boolean, default: false}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, discountSchema);