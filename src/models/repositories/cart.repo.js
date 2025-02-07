'use strict'

const { convertToObjectIdMongodb, unSelectData } = require('../../utils')
const CART = require('../cart.model')

const createCart = async ({
    userId,
    product
}) => {
    const newCart = await CART.create(
        {
            userId,
            cart_products: product
        }
    )
    return newCart
}

const updateProductQuantity = async ({ cartId, userId, product }) => {
    const cart = await CART.findOneAndUpdate(
        {
            _id: convertToObjectIdMongodb(cartId),
            userId: convertToObjectIdMongodb(userId),
            cart_state: 'active',
            'cart_products.productId': product.productId
        },
        {
            $inc: {
                'cart_products.$[elem].quantity': product.quantity
            }
        },
        {
            new: true,
            arrayFilters: [{ 'elem.productId': product.productId }]
        }
    )
    return cart
}

const getOneCartByUserId = async ({
    userId,
}) => {
    const cart = await CART.findOne({
        userId: convertToObjectIdMongodb(userId)
    })
    return cart
}

const updateCartCount = async ({
    userId,
    quantity
}) => {
    return await CART.findOneAndUpdate(
        {
            userId
        },
        {
            $inc: {
                cart_count_product: quantity
            }
        },
        {
            new: true
        }
    )
}

const removeFromCart = async ({
    userId,
    productId
}) => {
    const cart = await CART.findOneAndUpdate(
        {
            userId,
            'cart_products.productId': productId
        },
        {
            $pull: {
                'cart_products': {
                    productId: productId
                }
            }
        },
        {
            new: true
        }
    )
    return cart
}

const clearCart = async ({
    userId
}) => {
    const cart = await CART.findOneAndUpdate(
        {
            userId
        },
        {
            $set: {
                cart_products: []
            }
        },
        {
            new: true
        }
    )
    return cart
}

const getListProductFromCart = async ({
    userId,
    unSelect = []
}) => {
    const cart = await CART.aggregate([
        {
            $match: {
                userId: convertToObjectIdMongodb(userId)
            }
        },
        {
            $unwind: '$cart_products'
        },
        {
            $lookup: {
                from: 'Skus',
                localField: 'cart_products.productId',
                foreignField: 'skuId',
                as: 'variant'
            }
        },
        {
            $unwind: '$variant'
        },
        {
            $project: {
                _id: 0,
                cart_state: 0,
                __v: 0
            }
        }
    ])
    return cart
}


module.exports = {
    createCart,
    getOneCartByUserId,
    updateProductQuantity,
    removeFromCart,
    clearCart,
    updateCartCount,
    getListProductFromCart
}