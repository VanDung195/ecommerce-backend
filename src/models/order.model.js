'use strict'

const { Schema, model} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

//sub-schema for checkout
const checkoutSchema = new Schema({
    totalPrice: { type: Number, required: true },
    totalApplyDiscount: { type: Number, default: 0 },
    feeShip: { type: Number, default: 0 },
}, { _id: false });

const shippingSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
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
    price_raw: { type: Number, required: true},
    price_apply_discount: { type: Number, required: true},
    item_products: { type: Array, required: true}
}, { _id: false })

const cancellationSchema = new Schema({
    reason: { type: String, default: ''},
    cancelledAt: { type: Date, default: Date.now},
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true}
})

var orderSchema = new Schema({
    order_userId: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
    order_checkout: { type: checkoutSchema, required: true},
    order_shipping: { type: shippingSchema, required: true},
    order_payment: { type: paymentSchema, required: true},
    order_products: { type: [orderProductSchema], required: true},
    order_status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered', 'returned'], default: 'pending'},
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