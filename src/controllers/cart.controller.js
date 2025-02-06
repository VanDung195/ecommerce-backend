'use strict'

const { SuccessResponse } = require("../core/success.response")
const { addToCartService } = require("../services/cart.service")

class CartController{
    addToCart = async(req, res, next) => {
        new SuccessResponse({
            message: 'Add to cart successfully',
            metadata: await addToCartService({
                userId: req.user.userId,
                ...req.body
            })
        }).send(res)
    }
}

module.exports = new CartController()