'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const CART = require('../cart.model')

const createCart = async ({
    userId,
    product_shop
}) => {
    const newCart = await CART.create(
        {
            userId,
            cart_products: product_shop
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

const updateProductQuantityV2 = async ({ cartId, userId, product_shop }) => {
    product_shop.shopId = convertToObjectIdMongodb(product_shop.shopId)
    const cart = await CART.findOneAndUpdate(
        {
            _id: convertToObjectIdMongodb(cartId),
            userId: convertToObjectIdMongodb(userId),
            cart_state: 'active',
            'cart_products.shopId': product_shop.shopId,
            'cart_products.product_shop.productId': product_shop.productId
        },
        {
            $inc: {
                'cart_products.$[shop].product_shop.$[product].quantity': product_shop.quantity
            }
        },
        {
            new: true,
            arrayFilters: [
                { 'shop.shopId': product_shop.shopId },
                { 'product.productId': product_shop.productId }
            ]
        }
    )
    return cart
}


const getCartByUserId = async ({
    userId,
}) => {
    const cart = await CART.findOne({
        userId: convertToObjectIdMongodb(userId)
    })
    return cart
}

const getCartForOrder = async({
    userId
}) => {
    const cart = await CART.aggregate([
        {
            $match: {
                userId: convertToObjectIdMongodb(userId)
            }
        },
        {
            $addFields: {
                cart_products: {
                    $filter: {
                        input: {
                            $map: {
                                input: '$cart_products',
                                as: 'cart_product',
                                in: {
                                    $mergeObjects: [
                                        '$$cart_product',
                                        {
                                            product_shop: {
                                                $filter: {
                                                    input: '$$cart_product.product_shop',
                                                    as: 'product',
                                                    cond: { $eq: ['$$product.isSelected', true] }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        as: 'cart_product',
                        cond: { $gt: [{ $size: '$$cart_product.product_shop' },0]}
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'Shops',
                localField: 'cart_products.shopId',
                foreignField: '_id',
                as: 'shop_info'
            }
        },
        {
            $addFields: {
                cart_products: {
                    $map: {
                        input: '$cart_products',
                        as: 'product',
                        in: {
                            $mergeObjects: [
                                '$$product',
                                {
                                    shop_info: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$shop_info',
                                                    as: 'shop',
                                                    cond: {
                                                        $eq: ['$$shop._id', '$$product.shopId']
                                                    }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unset: 'shop_info'
        },
        {
            $lookup: {
                from: 'Skus',
                localField: 'cart_products.product_shop.productId',
                foreignField: 'skuId',
                as: 'sku_info'
            }
        },
        {
            $addFields: {
                cart_products: {
                    $map: {
                        input: '$cart_products',
                        as: 'cart_product',
                        in: {
                            $mergeObjects: [
                                '$$cart_product',
                                {
                                    product_shop: {
                                        $map: {
                                            input: '$$cart_product.product_shop',
                                            as: 'product',
                                            in: {
                                                $mergeObjects: [
                                                    '$$product',
                                                    {
                                                        sku_info: {
                                                            $arrayElemAt: [
                                                                {
                                                                    $filter: {
                                                                        input: '$sku_info',
                                                                        as: 'sku',
                                                                        cond: {
                                                                            $eq: ['$$sku.skuId', '$$product.productId']
                                                                        }
                                                                    }
                                                                },
                                                                0
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unset: 'sku_info'
        },
        {
            $project: {
                cart_state: 0,
                _id: 0,
                'cart_products.product_shop.sku_info._id': 0,
                'cart_products.product_shop.sku_info.skuId': 0,
                'cart_products.product_shop.sku_info.sku_default': 0,
                'cart_products.product_shop.sku_info.sku_slug': 0,
                'cart_products.product_shop.sku_info.isDraft': 0,
                'cart_products.product_shop.sku_info.isPublished': 0,
                'cart_products.product_shop.sku_info.isDeleted': 0,
                'cart_products.product_shop.sku_info.createdAt': 0,
                'cart_products.product_shop.sku_info.updatedAt': 0,
                'cart_products.product_shop.sku_info.__v': 0,
                'cart_products.shop_info._id': 0,
                'cart_products.shop_info.userId': 0,
                'cart_products.shop_info.shop_phone': 0,
                'cart_products.shop_info.shop_status': 0,
                'cart_products.shop_info.shop_verify': 0,
                'cart_products.shop_info.shop_description': 0,
                'cart_products.shop_info.shop_type': 0,
                'cart_products.shop_info.createdAt': 0,
                'cart_products.shop_info.updatedAt': 0,
                'cart_products.shop_info.__v': 0,
            }
        },
        {
            $lookup: {
                from: 'Spus',
                localField: 'cart_products.product_shop.sku_info.productId',
                foreignField: '_id',
                as: 'spu_info'
            }
        },
        {
            $addFields: {
                cart_products: {
                    $map: {
                        input: '$cart_products',
                        as: 'cart_product',
                        in: {
                            $mergeObjects: [
                                '$$cart_product',
                                {
                                    product_shop: {
                                        $map: {
                                            input: '$$cart_product.product_shop',
                                            as: 'product',
                                            in: {
                                                $mergeObjects: [
                                                    '$$product',
                                                    {
                                                        product_info: {
                                                            $arrayElemAt: [
                                                                {
                                                                    $filter: {
                                                                        input: '$spu_info',
                                                                        as: 'spu',
                                                                        cond: { 
                                                                            $eq: ['$$spu._id', '$$product.sku_info.productId']
                                                                        }
                                                                    }
                                                                }, 
                                                                0
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unset: 'spu_info'
        },
        {
            $project: {
                'cart_products.product_shop.product_info._id': 0,
                'cart_products.product_shop.product_info.product_price': 0,
                'cart_products.product_shop.product_info.product_min_price': 0,
                'cart_products.product_shop.product_info.product_max_price': 0,
                'cart_products.product_shop.product_info.product_category': 0,
                'cart_products.product_shop.product_info.product_quantity': 0,
                'cart_products.product_shop.product_info.product_shop': 0,
                'cart_products.product_shop.product_info.isDraft': 0,
                'cart_products.product_shop.product_info.isPublished': 0,
                'cart_products.product_shop.product_info.isDeleted': 0,
                'cart_products.product_shop.product_info.createdAt': 0,
                'cart_products.product_shop.product_info.updatedAt': 0,
                'cart_products.product_shop.product_info.__v': 0,
                'cart_products.product_shop.product_info.product_variations.images': 0,
                cart_count_product: 0,
                __v: 0
            }
        }
    ])
    return cart[0]
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

// const removeFromCart = async ({
//     userId,
//     productId,
//     shopId
// }) => {
//     const cart = await CART.findOneAndUpdate(
//         {
//             userId,
//             'cart_products.productId': productId,
//             'cart_products.shopId': shopId
//         },
//         {
//             $pull: {
//                 'cart_products': {
//                     productId: productId
//                 }
//             }
//         },
//         {
//             new: true
//         }
//     )
//     return cart
// }

const removeFromCart = async ({
    userId,
    productId,
    shopId
}) => {
    const cart = await CART.findOneAndUpdate(
        {
            userId,
            cart_state: 'active',
            'cart_products.shopId': convertToObjectIdMongodb(shopId),
        },
        {
            $pull: {
                'cart_products.$[shop].product_shop': {
                    productId: productId
                }
            }
        },
        {
            new: true,
            arrayFilters: [
                { 'shop.shopId': convertToObjectIdMongodb(shopId) }
            ]
        }
    )
    return cart
}

const removeCartShop = async ({
    userId,
    shopId
}) => {
    const cart = await CART.findOneAndUpdate(
        {
            userId,
            cart_state: 'active',
            'cart_products.shopId': convertToObjectIdMongodb(shopId)
        },
        {
            $pull: {
                'cart_products': {
                    shopId: convertToObjectIdMongodb(shopId)
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

const getListProductFromCart = async({
    userId,
    limit,
    page
}) => {
    const offset = (page - 1) * limit
    const cart = await CART.aggregate([
        {
            $match: {
                userId: convertToObjectIdMongodb(userId)
            }
        },
        {
            $lookup: {
                from: 'Shops',
                localField: 'cart_products.shopId',
                foreignField: '_id',
                as: 'shop_info'
            }
        },
        {
            $addFields: {
                cart_products: {
                    $map: {
                        input: '$cart_products',
                        as: 'product',
                        in: {
                            $mergeObjects: [
                                '$$product',
                                {
                                    shop_info: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$shop_info',
                                                    as: 'shop',
                                                    cond: {
                                                        $eq: ['$$shop._id', '$$product.shopId']
                                                    }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unset: 'shop_info'
        },
        {
            $lookup: {
                from: 'Skus',
                localField: 'cart_products.product_shop.productId',
                foreignField: 'skuId',
                as: 'sku_info'
            }
        },
        {
            $addFields: {
                cart_products: {
                    $map: {
                        input: '$cart_products',
                        as: 'cart_product',
                        in: {
                            $mergeObjects: [
                                '$$cart_product',
                                {
                                    product_shop: {
                                        $map: {
                                            input: '$$cart_product.product_shop',
                                            as: 'product',
                                            in: {
                                                $mergeObjects: [
                                                    '$$product',
                                                    {
                                                        sku_info: {
                                                            $arrayElemAt: [
                                                                {
                                                                    $filter: {
                                                                        input: '$sku_info',
                                                                        as: 'sku',
                                                                        cond: {
                                                                            $eq: ['$$sku.skuId', '$$product.productId']
                                                                        }
                                                                    }
                                                                },
                                                                0
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unset: 'sku_info'
        },
        {
            $project: {
                cart_state: 0,
                _id: 0,
                'cart_products.product_shop.sku_info._id': 0,
                'cart_products.product_shop.sku_info.skuId': 0,
                'cart_products.product_shop.sku_info.sku_default': 0,
                'cart_products.product_shop.sku_info.sku_slug': 0,
                'cart_products.product_shop.sku_info.isDraft': 0,
                'cart_products.product_shop.sku_info.isPublished': 0,
                'cart_products.product_shop.sku_info.isDeleted': 0,
                'cart_products.product_shop.sku_info.createdAt': 0,
                'cart_products.product_shop.sku_info.updatedAt': 0,
                'cart_products.product_shop.sku_info.__v': 0,
                'cart_products.shop_info._id': 0,
                'cart_products.shop_info.userId': 0,
                'cart_products.shop_info.shop_phone': 0,
                'cart_products.shop_info.shop_status': 0,
                'cart_products.shop_info.shop_verify': 0,
                'cart_products.shop_info.shop_description': 0,
                'cart_products.shop_info.shop_type': 0,
                'cart_products.shop_info.createdAt': 0,
                'cart_products.shop_info.updatedAt': 0,
                'cart_products.shop_info.__v': 0,
            }
        },
        {
            $lookup: {
                from: 'Spus',
                localField: 'cart_products.product_shop.sku_info.productId',
                foreignField: '_id',
                as: 'spu_info'
            }
        },
        {
            $addFields: {
                cart_products: {
                    $map: {
                        input: '$cart_products',
                        as: 'cart_product',
                        in: {
                            $mergeObjects: [
                                '$$cart_product',
                                {
                                    product_shop: {
                                        $map: {
                                            input: '$$cart_product.product_shop',
                                            as: 'product',
                                            in: {
                                                $mergeObjects: [
                                                    '$$product',
                                                    {
                                                        product_info: {
                                                            $arrayElemAt: [
                                                                {
                                                                    $filter: {
                                                                        input: '$spu_info',
                                                                        as: 'spu',
                                                                        cond: { 
                                                                            $eq: ['$$spu._id', '$$product.sku_info.productId']
                                                                        }
                                                                    }
                                                                }, 
                                                                0
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unset: 'spu_info'
        },
        {
            $project: {
                'cart_products.product_shop.product_info._id': 0,
                'cart_products.product_shop.product_info.product_price': 0,
                'cart_products.product_shop.product_info.product_min_price': 0,
                'cart_products.product_shop.product_info.product_max_price': 0,
                'cart_products.product_shop.product_info.product_category': 0,
                'cart_products.product_shop.product_info.product_quantity': 0,
                'cart_products.product_shop.product_info.product_shop': 0,
                'cart_products.product_shop.product_info.isDraft': 0,
                'cart_products.product_shop.product_info.isPublished': 0,
                'cart_products.product_shop.product_info.isDeleted': 0,
                'cart_products.product_shop.product_info.createdAt': 0,
                'cart_products.product_shop.product_info.updatedAt': 0,
                'cart_products.product_shop.product_info.__v': 0,
                'cart_products.product_shop.product_info.product_variations.images': 0,
            }
        },
        {
            $addFields: {
                cart_products: {
                    $slice: ['$cart_products', offset, limit]
                }
            }
        }
    ])
    return cart[0]
}

const selectProductFromCart = async ({ userId, shopId, productId }) => {
    shopId = convertToObjectIdMongodb(shopId)
    const cart = await CART.findOneAndUpdate(
        {
            userId,
            'cart_products.shopId': shopId,
            'cart_products.product_shop.productId': productId
        },
        [
            {
                $set: {
                    cart_products: {
                        $map: {
                            input: "$cart_products",
                            as: "shop",
                            in: {
                                $cond: {
                                    if: { $eq: ["$$shop.shopId", shopId] },
                                    then: {
                                        $mergeObjects: [
                                            "$$shop",
                                            {
                                                product_shop: {
                                                    $map: {
                                                        input: "$$shop.product_shop",
                                                        as: "prod",
                                                        in: {
                                                            $cond: {
                                                                if: { $eq: ["$$prod.productId", productId] },
                                                                then: {
                                                                    $mergeObjects: [
                                                                        "$$prod",
                                                                        { isSelected: { $not: ["$$prod.isSelected"] } }
                                                                    ]
                                                                },
                                                                else: "$$prod"
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    else: "$$shop"
                                }
                            }
                        }
                    }
                }
            }
        ],
        { new: true }
    )
    return cart
}

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
const applyDiscountProductCart = async({
    userId,
    shopId,
    discount
}) => {
    const cart = await CART.findOneAndUpdate(
        {
            userId: convertToObjectIdMongodb(userId),
            'cart_products.shopId': convertToObjectIdMongodb(shopId),
            cart_state: 'active'
        },
        {
            $set: {
                'cart_products.$.shop_discount': {
                    shopId: discount.shopId,
                    discountId: discount.discountId,
                    code: discount.code
                }
            }
        },
        {
            new: true
        }
    )
    return cart
}

const removeDiscountProductCart = async({
    userId,
    shopId,
}) => {
    const cart = await CART.findOneAndUpdate(
        {
            userId: convertToObjectIdMongodb(userId),
            'cart_products.shopId': convertToObjectIdMongodb(shopId),
            cart_state: 'active'
        },
        {
            $set: {
                'cart_products.$.shop_discount': null
            }
        },
        {
            new: true
        }
    )
    return cart
}

module.exports = {
    createCart,
    getCartByUserId,
    updateProductQuantity,
    updateProductQuantityV2,
    removeFromCart,
    clearCart,
    updateCartCount,
    getListProductFromCart,
    selectProductFromCart,
    removeCartShop,
    applyDiscountProductCart,
    removeDiscountProductCart,
    getCartForOrder
}