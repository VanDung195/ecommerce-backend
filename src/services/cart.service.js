'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response')
const { getCartByUserId, createCart, updateProductQuantity, removeFromCart, clearCart, updateCartCount, getListProductFromCart, selectProductFromCart, updateProductQuantityV2, removeCartShop, applyDiscountProductCart, updateDiscountProductCart, removeDiscountProductCart, getShopInCart } = require("../models/repositories/cart.repo")
const { getOneDiscountCode } = require('../models/repositories/discount.repo')
const { findShopById, findShopByShopId } = require('../models/repositories/shop.repo')
const { getOneSkuById, getSkusByListSkuId } = require('../models/repositories/sku.repo')

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
    const userCart = await getCartByUserId({ userId })
    if(!userCart){
        return await createCart({
            userId,
            product_shop: [
                {
                    shopId: product.shopId,              
                    product_shop: [                       
                        {
                            productId: product.productId,
                            name: foundProduct.productId.product_name,
                            price: foundProduct.sku_price,
                            quantity: product.quantity
                        }
                    ]
                }
            ]
        })
    }
    const existsProductInCart = userCart.cart_products.some(shop => 
        shop.product_shop.some(productItem => productItem.productId === product.productId)
    )
    if(!existsProductInCart){
        userCart.cart_count_product = userCart.cart_count_product + 1
        let shopInCart = userCart.cart_products.find(shop => shop.shopId.toString() === product.shopId)
        if(shopInCart){
            shopInCart.product_shop.push({
                productId: product.productId,
                name: foundProduct.productId.product_name,
                price: foundProduct.sku_price,
                quantity: product.quantity
            })
        } else {
            userCart.cart_products.push({
                shopId: product.shopId,
                product_shop: [
                    {
                        productId: product.productId,
                        name: foundProduct.productId.product_name,
                        price: foundProduct.sku_price,
                        quantity: product.quantity
                    }
                ]
            })
        }
        return await userCart.save()
    }
    return await updateProductQuantityV2({
        cartId: userCart._id,
        userId,
        product_shop: product
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
    product
}) => {
    const foundCart = await getCartByUserId({ userId })
    if(!foundCart) 
        throw new NotFoundError('Cart not found')
    const foundProduct = await getOneSkuById(product.productId)
    const shopId = foundProduct.productId.product_shop
    if(foundProduct.productId.product_shop.toString() !== product.shopId)
        throw new BadRequestError('Invalid shop')
    if(!foundProduct)
        throw new NotFoundError('Product not found')
    if(product.quantity === 0){
        const delCart = await removeFromCart({ userId, productId: product.productId, shopId: shopId.toString() })
        const shopIndex = delCart.cart_products.findIndex( shop => shop.shopId.toString() === shopId.toString())
        if(shopIndex !== -1){
            const shopProducts = delCart.cart_products[shopIndex].product_shop
            if(shopProducts.length === 0){
                await removeCartShop({ userId, shopId })
            }
        }

        return delCart
    }
    product.quantity = product.quantity - product.old_quantity
    const cart = await updateProductQuantityV2({
        cartId: foundCart._id,
        userId,
        product_shop: product
    })
    if(cart.cart_count_product <= 0)
        return await removeFromCart({ userId, productId: product.productId })
    return cart
}

//remove one product from cart
const removeFromCartService = async({
    userId,
    shopId,
    productId
}) => {
    const foundCart = await getCartByUserId({ userId })
    if(!foundCart) 
        throw new NotFoundError('Cart not found')
    const foundProduct = await getOneSkuById(productId)
    if(!foundProduct)
        throw new NotFoundError('Product not found')
    await updateCartCount({ userId, quantity: -1})
    const delCart = await removeFromCart({ userId, productId, shopId})
    const shopIndex = delCart.cart_products.findIndex( shop => shop.shopId.toString() === shopId)
    if(shopId !== -1){
        const shopProducts = delCart.cart_products[shopIndex].product_shop
        if(shopProducts.length === 0){
            await removeCartShop({ userId, shopId })
        }
    }
    return delCart
}

const clearCartService = async({
    userId
}) => {
    const foundCart = await getCartByUserId({ userId })
    if(!foundCart) 
        throw new NotFoundError('Cart not found')
    await updateCartCount({ userId, quantity: -foundCart.cart_count_product})
    return await clearCart({ userId })
}

const listToCartService = async({
    userId,
    limit = 1,
    page = 1
}) => {
    const foundCart = await getListProductFromCart({ userId, limit, page })
    if(!foundCart)
        throw new NotFoundError('Cart not found')
    return foundCart
}
//lấy ra các sản phẩm trong giỏ hàng, chỉ các sản phẩm được chọn
const getSeletedProductFromCartServiceV2 = async({
    userId,
    shopId,
    products
}) => {
    const cart = await getCartByUserId({ userId })
    if(!cart)
        throw new NotFoundError('Cart not found')
    const shopInCart = await getShopInCart({ userId, shopId})
    if(!shopInCart)
        throw new NotFoundError('Shop in cart not found')
    const seletedProducts = {
        shopId,
        products: []
    }
    shopInCart.product_shop.map( product => {
        if(products.includes(product.productId)){
            seletedProducts.products.push(product)
        }
    })
    return seletedProducts
}

const getSeclectedProductFromCartService = async({
    userId,
    shopId,
    products
}) => {
    const shopInCart = await getShopInCart({ userId, shopId})
    if(!shopInCart)
        throw new NotFoundError('Shop in cart not found')
    const foundShop = await findShopByShopId(shopId)
    if(!foundShop)
        throw new NotFoundError('Shop not found')
    let selectedProducts = {
        shop: {
            shopId: foundShop._id, 
            name: foundShop.shop_name,
            logo: foundShop.shop_logo
        },
        products: []
    }
    selectedProducts.products = shopInCart.product_shop.filter(product =>
        products.includes(product.productId)
    )
    const selectedProductIds = selectedProducts.products.map(product => product.productId);
    const productData = await getSkusByListSkuId({ skuIds: selectedProductIds, selectData: ['skuId', 'sku_price', 'sku_tier_idx', 'sku_stock', 'productId'] })
    const skuDataMap = productData.reduce((map, sku) => {
        map.set(sku.skuId, sku);
        return map;
    }, new Map());
    selectedProducts.products = selectedProducts.products.map(product => {
        const sku = skuDataMap.get(product.productId) || {};
        return {
          ...product,
          price: sku.sku_price,
          tier_idx: sku.sku_tier_idx,
          stock: sku.sku_stock,
          product_info_id: sku.productId,
        };
      });

    return selectedProducts
}

module.exports = {
    addToCartService,
    updateCartQuantityService,
    removeFromCartService,
    clearCartService,
    listToCartService,
    getSeclectedProductFromCartService
}