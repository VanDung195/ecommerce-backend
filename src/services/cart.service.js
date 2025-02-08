'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response')
const { getOneCartByUserId, createCart, updateProductQuantity, removeFromCart, clearCart, updateCartCount, getListProductFromCart, selectProductFromCart } = require("../models/repositories/cart.repo")
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
                name: foundProduct.productId.product_name,
                price: foundProduct.sku_price,
                isSelected: false,
                ...product
            }
        })
    }
    const existsProductInCart = userCart.cart_products.some(productInCart => productInCart.productId === product.productId);
    if(!existsProductInCart){
        userCart.cart_count_product = userCart.cart_count_product + 1
        userCart.cart_products.push({
            name: foundProduct.productId.product_name,
            price: foundProduct.sku_price,
            isSelected: false,
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
    if(foundProduct.productId.product_shop.toString() !== shopProduct.shopId)
        throw new BadRequestError('Invalid shop')
    if(!foundProduct)
        throw new NotFoundError('Product not found')
    if(shopProduct.quantity === 0)
        return await removeFromCart({ userId, productId: shopProduct.productId })
    shopProduct.quantity = shopProduct.quantity - shopProduct.old_quantity
    const cart = await updateProductQuantity({
        cartId: foundCart._id,
        userId,
        product: shopProduct
    })
    if(cart.cart_count_product <= 0)
        return await removeFromCart({ userId, productId: shopProduct.productId })
    return cart
}

const removeFromCartService = async({
    userId,
    shopId,
    productId
}) => {
    const foundCart = await getOneCartByUserId({ userId })
    if(!foundCart) 
        throw new NotFoundError('Cart not found')
    const foundProduct = await getOneSkuById(productId)
    if(!foundProduct)
        throw new NotFoundError('Product not found')
    await updateCartCount({ userId, quantity: -1})
    return await removeFromCart({ userId, productId, shopId})
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

const toggleSelectionProductFromCartService = async({
    userId,
    shopId,
    productId
}) => {
    const foundCart = await getOneCartByUserId({ userId })
    if(!foundCart) 
        throw new NotFoundError('Cart not found')
    const foundProduct = await getOneSkuById(productId)
    if(foundProduct.productId.product_shop.toString() !== shopId)
        throw new BadRequestError('Invalid shop')
    if(!foundProduct)
        throw new NotFoundError('Product not found')
    return await selectProductFromCart({
        userId,
        shopId,
        productId
    })
}

module.exports = {
    addToCartService,
    updateCartQuantityService,
    removeFromCartService,
    clearCartService,
    listToCartService,
    toggleSelectionProductFromCartService
}