'use strict'

const { getOneCartByUserId, createCart, updateProductQuantity } = require("../models/repositories/cart.repo")

/*
    - product: 
    {
        productId,
        shopId,
        name,
        price,
        quantity,
    }
*/
const addToCartService = async({
    userId,
    product = {}
}) => {
    const userCart = await getOneCartByUserId({ userId })
    if(!userCart){
        return await createCart({
            userId,
            product
        })
    }
    const existsProductInCart = userCart.cart_products.some(productInCart => productInCart.productId === product.productId);
    if(!existsProductInCart){
        userCart.cart_products.push(product)
        return await userCart.save()
    }
    //update quantity from cart
    return await updateProductQuantity({
        cartId: userCart._id,
        userId,
        product
    })
}

const removeFromCartService = async({

}) => {

}

const updateQuantityCart = async({

}) => {
    
}

const clearCartService = async({

}) => {

}



module.exports = {
    addToCartService
}