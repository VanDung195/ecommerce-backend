'use strict'

const { Schema, model} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

//sub-schema for checkout
const checkoutSchema = new Schema({
    total_price: { type: Number, required: true },
    total_apply_discount: { type: Number, default: 0 },
    total_checkout: { type: Number, required: true, min: 1000},
    fee_ship: { type: Number, default: 0 },
}, { _id: false });

const shippingSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'Viet Nam' },
}, { _id: false });

const paymentSchema = new Schema({
    method: { 
        type: String, 
        enum: ['cash', 'visa', 'paypal', 'credit_card'], 
        required: true 
    },
    transactionId: { type: String, default: '' },
}, { _id: false });

const orderProductSchema = new Schema({
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true},
    shop_discount: { type: Object, default: {}},
    // price_raw: { type: Number, required: true},
    // price_apply_discount: { type: Number, default: 0},
    item_products: { type: Array, required: true}
}, { _id: false })

const cancellationSchema = new Schema({
    reason: {
        code: { type: String, enum: [
            'buyer_no_longer_wants', 
            'better_price_found', 
            'wrong_item_ordered', 
            'buyer_changed_mind', 
            'seller_no_response', 
            'seller_cannot_deliver_on_time', 
            'out_of_stock', 
            'seller_requested_cancellation', 
            'other'
        ], default: 'buyer_no_longer_wants'},
        detail: { type: String, default: ''}
    },
    cancelledAt: { type: Date, default: null},
    shop_approval: { type: String, enum: ['pending', 'approved', 'reject'], default: 'pending'}
})

var orderSchema = new Schema({
    order_userId: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
    order_checkout: { type: checkoutSchema, required: true},
    order_shipping: { type: shippingSchema, required: true},
    order_payment: { type: paymentSchema, required: true},
    order_products: { type: orderProductSchema, required: true},
    // order_status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned'], default: 'pending'},
    order_status: { type: String, enum: ['pending', 'shipping', 'pending_delivery', 'completed', 'cancelled', 'returned'], default: 'pending'},
    order_cancellation: { type: cancellationSchema, default: null},
    order_note: { type: String, default: ''}
}, {
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, orderSchema);