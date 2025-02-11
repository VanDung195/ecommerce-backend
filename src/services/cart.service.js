'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response')
const { getOneCartByUserId, createCart, updateProductQuantity, removeFromCart, clearCart, updateCartCount, getListProductFromCart, selectProductFromCart, updateProductQuantityV2, removeCartShop, applyDiscountProductCart } = require("../models/repositories/cart.repo")
const { getOneDiscountCode } = require('../models/repositories/discount.repo')
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
            product_shop: [
                {
                    shopId: product.shopId,              
                    // shop_discount: null,
                    product_shop: [                       
                        {
                            productId: product.productId,
                            name: foundProduct.productId.product_name,
                            price: foundProduct.sku_price,
                            isSelected: false,
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
                isSelected: false,
                quantity: product.quantity
            })
        } else {
            userCart.cart_products.push({
                shopId: product.shopId,
                // shop_discount: {},
                product_shop: [
                    {
                        productId: product.productId,
                        name: foundProduct.productId.product_name,
                        price: foundProduct.sku_price,
                        isSelected: false,
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
    const foundCart = await getOneCartByUserId({ userId })
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

const applyDiscountForShopProductService = async({
    userId,
    shopId,
    discount_code
}) => {
    const foundDiscount = await getOneDiscountCode({ shopId, code: discount_code})
    if(!foundDiscount)
        throw new NotFoundError('Discount not found')
    const foundCart = await getOneCartByUserId({ userId })
    if(!foundCart)
        throw new NotFoundError('Cart not found')
    if(foundCart.cart_products.cart_count_product === 0)
        throw new BadRequestError('Invalid request')
    const shopInCart = foundCart.cart_products.find( shop => shop.shopId.toString() === shopId)
    if(!shopInCart)
        throw new NotFoundError('Shop in cart not found')

    // return shopInCart

    // const shopTotalPrice = shopInCart.product_shop.map( product => {
    //     return product.price * product.quantity
    // })
    const shopTotalPrice = shopInCart.product_shop.reduce((total, product) => {
        return total + (product.price * product.quantity);
    }, 0);
    
    let eligibleProducts = []
    if(foundDiscount.discount_applies_to === 'all'){
        eligibleProducts = shopInCart.product_shop.filter( product => product.isSelected)
    }
    if(foundDiscount.discount_applies_to === 'specific'){
        eligibleProducts = shopInCart.product_shop.filter( product => 
            product.isSelected && foundDiscount.discount_productIds.includes(product.productId)
        )
    }
    if(foundDiscount.discount_max_amount < shopTotalPrice)
        throw new BadRequestError(`Order total doesn't meet the discount minimum order value of ${foundDiscount.discount_min_order_value}.`)

    //check số tiền tối thiểu nữa
    //check start date and end date
    if(eligibleProducts.length === 0)
        throw new BadRequestError('No eliglible product found for discount')
    
    const discount = {
        shopId: shopId,
        discountId: foundDiscount._id,
        code: foundDiscount.discount_code
    }
    // const updatedCart = await applyDiscountProductCart({ userId, shopId, discount})

    // return updatedCart

    //chọn 1 sản phẩm để apply discount (sản phẩm có giá cao nhất)
    const productToDiscount = eligibleProducts.reduce( (prev, current) => {
        return (prev.price > current.price ? prev : current)
    })

    const discountType = foundDiscount.discount_type
    const discountValue = 0
    if(discountType === 'fixed_amount'){
        discountValue = foundDiscount.discount_value
    } else {
        discountValue = (productToDiscount.price * foundDiscount.discount_value) / 100 
    }

    return discountValue
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
    toggleSelectionProductFromCartService,
    applyDiscountForShopProductService
}