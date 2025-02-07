'use strict'

const { SuccessResponse } = require("../core/success.response")
const { addToCartService, updateCartQuantityService, removeFromCartService, clearCartService, listToCartService } = require("../services/cart.service")

class CartController{
    listToCart = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list product successfully',
            metadata: await listToCartService({ userId: req.user.userId })
        }).send(res)
    }

    addToCart = async(req, res, next) => {
        new SuccessResponse({
            message: 'Add to cart successfully',
            metadata: await addToCartService({
                userId: req.user.userId,
                product: req.body
            })
        }).send(res)
    }

    updateQuantity = async(req, res, next) => {
        new SuccessResponse({
            message: 'Update quantity successfully',
            metadata: await updateCartQuantityService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    removeFromCart = async(req, res, next) => {
        new SuccessResponse({
            message: 'Remove product from cart successfully',
            metadata: await removeFromCartService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }

    clearCart = async(req, res, next) => {
        new SuccessResponse({
            message: 'Clear cart successfully',
            metadata: await clearCartService({ userId: req.user.userId})
        }).send(res)
    }
}

module.exports = new CartController()