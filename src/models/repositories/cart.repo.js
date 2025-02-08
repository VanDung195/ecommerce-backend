'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const CART = require('../cart.model')

const createCart = async ({
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

const updateProductQuantity = async ({ cartId, userId, product }) => {
    console.log(product);

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

const removeFromCart = async ({
    userId,
    productId,
    shopId
}) => {
    const cart = await CART.findOneAndUpdate(
        {
            userId,
            'cart_products.productId': productId,
            'cart_products.shopId': shopId
        },
        {
            $pull: {
                'cart_products': {
                    productId: productId
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
    userId,
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
            $lookup: {
                from: 'Skus',
                localField: 'cart_products.productId',
                foreignField: 'skuId',
                as: 'variantInfo'
            }
        },
        {
            $unwind: '$variantInfo'
        },
        {
            $project: {
                _id: 0,
                cart_state: 0,
                __v: 0,
                userId: 0,
                'variantInfo._id': 0,
                'variantInfo.isDraft': 0,
                'variantInfo.isPublished': 0,
                'variantInfo.isDeleted': 0,
                'variantInfo.createdAt': 0,
                'variantInfo.updatedAt': 0,
                'variantInfo.__v': 0,
                'variantInfo.skuId': 0,
            }
        },
        {
            $lookup: {
                from: 'Spus',
                localField: 'variantInfo.productId',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        {
            $project: {
                'productInfo._id': 0,
                'productInfo.isDraft': 0,
                'productInfo.isPublished': 0,
                'productInfo.isDeleted': 0,
                'productInfo.createdAt': 0,
                'productInfo.updatedAt': 0,
                'productInfo.__v': 0,
            }
        },
        {
            $unwind: '$productInfo'
        },
        {
            $project: {
                cart_count_product: 1,
                product: {
                    name: '$productInfo.product_name',
                    price: '$productInfo.product_price',
                    quantity: '$cart_products.quantity',
                    shopId: '$productInfo.product_shop',
                    productId: '$cart_products.productId',
                    isSelected: '$cart_products.isSelected',
                    productVariations: '$productInfo.product_variations',
                    totalPrice: {
                        $multiply: ['$productInfo.product_price', '$cart_products.quantity']
                    },
                    variant: '$variantInfo'
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

const selectProductFromCart = async ({ userId, shopId, productId }) => {
    const cart = await CART.findOneAndUpdate(
        {
            userId,
            'cart_products.productId': productId,
            'cart_products.shopId': shopId
        },
        [
            {
                $set: {
                    cart_products: {
                        $map: {
                            input: "$cart_products",
                            as: "item",
                            in: {
                                $cond: {
                                    if: {
                                        $and: [
                                            { $eq: ["$$item.productId", productId] },
                                            { $eq: ["$$item.shopId", shopId] }
                                        ]
                                    },
                                    then: {
                                        $mergeObjects: [
                                            "$$item",
                                            { isSelected: { $not: ["$$item.isSelected"] } }
                                        ]
                                    },
                                    else: "$$item"
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
    removeFromCart,
    clearCart,
    updateCartCount,
    getListProductFromCart,
    selectProductFromCart
}