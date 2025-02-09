'use strict'

const { model, Schema} = require('mongoose')

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

const productCartSchema = new Schema({
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true},
    shop_discount: { type: Object, default: null},
    product_shop: { type: Array, default: []}
}, { _id: 0 })

const cartSchema = new Schema({
    cart_state: {
        type: String,
        required: true,
        enum: ['active', 'complete', 'failed', 'pending'],
        default: 'active'
    },
    cart_products: {type: [productCartSchema], required: true},
    /*
        [
            {
                shopId,
                shop_discount: {
                    shopId,
                    discountId,
                    codeId    
                }
                product_shop: [
                    {
                        productId,
                        name,
                        price,
                        quantity,
                        isSelected
                    }
                ]
            }
        ]    
    */
    cart_count_product: {type: Number, default: 1},
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'}
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createOn',
        updatedAt: 'modifiedOn'
    }
})

module.exports = model(DOCUMENT_NAME, cartSchema);