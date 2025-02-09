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

const getListProductFromCart = async ({
    userId
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
            $unwind: '$cart_products.product_shop'
        },
        {
            $lookup: {
                from: 'Skus',
                localField: 'cart_products.product_shop.productId',
                foreignField: 'skuId',
                as: 'variant_info'
            }
        },
        {
            $project: {
                _id: 0,
                cart_state: 0,
                userId: 0,
                createOn: 0,
                modifiedOn: 0,
                __v: 0,
                'variant_info.isDraft': 0,
                'variant_info.isPublished': 0,
                'variant_info.isDeleted': 0,
                'variant_info.createdAt': 0,
                'variant_info.updatedAt': 0,
                'variant_info.__v': 0,
            }
        },
        {
            $lookup: {
                from: 'Spus',
                localField: 'variant_info.productId',
                foreignField: '_id',
                as: 'spu'
            }
        },
        {
            $project: {
                'spu.isDraft': 0,
                'spu.isPublished': 0,
                'spu.isDeleted': 0,
                'spu.createdAt': 0,
                'spu.updatedAt': 0,
                'spu.__v': 0,
            }
        },
        {
            $unwind: '$variant_info'
        },
        {
            $unwind: '$spu'
        },
        {
            $project: {
                cart_count_product: 1,
                product: {
                    name: '$spu.product_name',
                    thumb: '$spu.product_thumb',
                    price: '$variant_info.sku_price',
                    quantity: '$cart_products.product_shop.quantity',
                    shopId: '$cart_products.shopId',
                    productId: '$cart_products.productId',
                    isSelected: '$cart_products.isSelected',
                    totalPrice: {
                        $multiply: ['$variant_info.sku_price', '$cart_products.product_shop.quantity']
                    },
                    variant: '$variant_info',
                    variationNameInfo: {
                        product_thumb: '$spu.product_thumb',
                        variations: '$spu.product_variations'
                    }
                },
            }
        },
        {
            $group: {
                _id: null,
                cart_count_product: {
                    $first: '$cart_count_product',
                },
                products: {
                    $push: '$product'
                }
            }
        },
        {
            $project: {
                _id: 0
            }
        }
    ])
    return cart
}

// const selectProductFromCart = async ({ userId, shopId, productId }) => {
//     const cart = await CART.findOneAndUpdate(
//         {
//             userId,
//             'cart_products.product_shop.productId': productId,
//             'cart_products.shopId': shopId
//         },
//         [
//             {
//                 $set: {
//                     cart_products: {
//                         $map: {
//                             input: "$cart_products",
//                             as: "item",
//                             in: {
//                                 $cond: {
//                                     if: {
//                                         $and: [
//                                             { $eq: ["$$item.product_shop.productId", productId] },
//                                             { $eq: ["$$item.shopId", shopId] }
//                                         ]
//                                     },
//                                     then: {
//                                         $mergeObjects: [
//                                             "$$item",
//                                             { isSelected: { $not: ["$$item.product_shop.isSelected"] } }
//                                         ]
//                                     },
//                                     else: "$$item"
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         ],
//         { new: true }
//     )
//     return cart
// }


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



module.exports = {
    createCart,
    getOneCartByUserId,
    updateProductQuantity,
    updateProductQuantityV2,
    removeFromCart,
    clearCart,
    updateCartCount,
    getListProductFromCart,
    selectProductFromCart,
    removeCartShop
}