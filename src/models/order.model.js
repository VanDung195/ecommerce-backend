'use strict'

const { Schema, model} = require('mongoose'); 

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

//sub-schema
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
    shop_discount: { type: Object, default: null},
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
            'seller_requested_cancellation', 
            'other'
        ], default: 'buyer_no_longer_wants'},
        detail: { type: String, default: ''}
    },
    requestedAt: { type: Date, default: () => new Date()},
    shop_approval: { type: String, enum: ['pending', 'approved', 'reject'], default: 'pending'},
    shop_reason: {
        code: { type: String, enum: [
            'order_already_processed',
            'buyer_confirmed_receipt',
            'custom_order_cannot_cancel',
            'out_of_stock', 
            'other'
        ], default: null},
        detail: { type: String, default: ''}
    },
    approvedAt: { type: Date, default: null}
}, { _id: false })
var orderStatusHistorySchema = new Schema({
    status: { type: String, enum: ['pending', 'confirmed', 'shipping', 'pending_delivery', 'completed', 'cancelled', 'returned'], default: 'pending'},
    changedAt: { type: Date, default: new Date()}
}, { _id: false })

const refundSchema = new Schema({
    refund_reason: {
        code: { type: String, enum: [
            'late_delivery',
            'customer_not_received',
            'other'
        ], required: true },
        detail: { type: String, default: ''}
    },
    requestedAt: { type: Date, default: () => new Date()},
    refund_status: { type: String, enum: ['pending', 'approved', 'reject' ]}
}, { _id: false })

var orderSchema = new Schema({
    order_userId: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
    order_checkout: { type: checkoutSchema, required: true},
    order_shipping: { type: shippingSchema, required: true},
    order_payment: { type: paymentSchema, required: true},
    order_products: { type: orderProductSchema, required: true},
    order_status: { type: String, enum: ['pending', 'confirmed', 'shipping', 'pending_delivery', 'completed', 'cancelled', 'returned'], default: 'pending'},
    order_status_history: { type: [orderStatusHistorySchema], default: [{ status: 'pending', changedAt: new Date()}]},
    order_cancellation: { type: cancellationSchema, default: null},
    order_refund: { type: refundSchema, default: null},
    order_note: { type: String, default: ''}
}, {
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, orderSchema);