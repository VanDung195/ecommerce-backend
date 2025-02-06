'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const CART = require('../cart.model')

const createCart = async({
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

const addProductToCart = async({
    cartId,
    userId,
    products
}) => {

}

const updateProductQuantity = async({
    cartId,
    userId,
    product
}) => {
    const cart = await CART.findOneAndUpdate(
        {
            _id: convertToObjectIdMongodb(cartId),
            userId: convertToObjectIdMongodb(userId),
            cart_state: 'active',
            'cart_products.productId': product.productId
        }, 
        {
            $inc: {
                'cart_products.quantity': product.quantity
            }
        },
        {
            new: true
        }
    )
    return cart
}

const getOneCartByUserId = async({
    userId
}) => {
    const cart = await CART.findOne(
        {
            cart_userId: convertToObjectIdMongodb(userId)
        }
    )
    return cart
}

module.exports = {
    createCart,
    getOneCartByUserId,
    updateProductQuantity
}