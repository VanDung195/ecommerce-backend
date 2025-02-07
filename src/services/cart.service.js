'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response')
const { getOneCartByUserId, createCart, updateProductQuantity, removeFromCart, clearCart, updateCartCount, getListProductFromCart } = require("../models/repositories/cart.repo")
const { findShopById, findShopByShopId } = require('../models/repositories/shop.repo')
const { getOneSkuById } = require('../models/repositories/sku.repo')

/*
    - product: 
    {
        productId,
        shopId,
        name,
        quantity,
    }
*/
const addToCartService = async({
    userId,
    product
}) => {
    const foundProduct = await getOneSkuById(product.productId)
    if(!foundProduct)
        throw new NotFoundError('Product not exists')
    if(foundProduct.productId.product_shop.toString() !== product.shopId)
        throw new BadRequestError('Invalid shop')
    const userCart = await getOneCartByUserId({ userId })
    if(!userCart){
        return await createCart({
            userId,
            product :{
                price: foundProduct.sku_price,
                ...product
            }
        })
    }
    const existsProductInCart = userCart.cart_products.some(productInCart => productInCart.productId === product.productId);
    if(!existsProductInCart){
        userCart.cart_count_product = userCart.cart_count_product + 1
        userCart.cart_products.push({
            price: foundProduct.sku_price,
            ...product
        })
        const cart = await userCart.save()
        return cart
    }

    return await updateProductQuantity({
        cartId: userCart._id,
        userId,
        product
    })
    // console.log(userCart);
    
    // if(existsProductInCart) {
    //     userCart.cart_products = userCart.cart_products.map( productInCart => {
    //         if(productInCart.name === product.name && productInCart.productId.toString() === product.productId){
    //             return { ...productInCart, quantity: productInCart.quantity + product.quantity}
    //         }
    //     })
    // } else {
    //     userCart.cart_products.push(product)
    //     userCart.cart_count_product = userCart.cart_products.length
    //     await updateCartCount({ userId, quantity: 1})
    // }
    // await userCart.save()
    // return userCart
}

/*
    shopProduct: {
        quantity,
        shopId, 
        old_quantity,
        productId   
    } 
    
*/
const updateCartQuantityService = async({
    userId,
    shopProduct
}) => {
    const foundCart = await getOneCartByUserId({ userId })
    if(!foundCart) 
        throw new NotFoundError('Cart not found')
    const foundProduct = await getOneSkuById(shopProduct.productId)
    if(!foundProduct)
        throw new NotFoundError('Product not found')
    if(shopProduct.quantity === 0)
        return await removeFromCart({
            userId, 
            productId: shopProduct.productId
        })

    return await updateProductQuantity({
        cartId: foundCart._id,
        userId,
        product: shopProduct
    })
}

const removeFromCartService = async({
    userId,
    productId
}) => {
    const foundCart = await getOneCartByUserId({ userId })
    if(!foundCart) 
        throw new NotFoundError('Cart not found')
    const foundProduct = await getOneSkuById(shopProduct.productId)
    if(!foundProduct)
        throw new NotFoundError('Product not found')
    await updateCartCount({ userId, quantity: -1})
    return await removeFromCart({ userId, productId})
}

const clearCartService = async({
    userId
}) => {
    const foundCart = await getOneCartByUserId({ userId })
    if(!foundCart) 
        throw new NotFoundError('Cart not found')
    await updateCartCount({ userId, quantity: -foundCart.cart_count_product})
    return await clearCart({ userId })
}

const listToCartService = async({
    userId
}) => {
    const foundCart = await getListProductFromCart({ userId })
    if(!foundCart)
        throw new NotFoundError('Cart not found')
    return foundCart
}

module.exports = {
    addToCartService,
    updateCartQuantityService,
    removeFromCartService,
    clearCartService,
    listToCartService
}