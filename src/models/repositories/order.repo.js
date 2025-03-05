'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const ORDER = require('../order.model')

const createOrder = async({
    userId,
    order_checkout,
    shipping,
    payment,
    order_products = [],
    order_note
}) => {
    const order = await ORDER.create({
        order_userId: userId,
        order_checkout,
        order_shipping: shipping,
        order_payment: payment,
        order_products,
        order_note
    })
    return order
}

const getOrderByUser = async({ userId, orderId }) => {
    return await ORDER.findOne({
        order_userId: userId,
        _id: convertToObjectIdMongodb(orderId)
    })
} 
 // {
        //     $addFields: {
        //         order_products: {
        //             $map: {
        //                 input: 'order_products.item_products',
        //                 as: 'product', 
        //                 in: {
        //                     $mergeObjects: [
        //                         '$$product',
        //                         {
        //                             sku_info: {
        //                                 $arrayElemAt: [
        //                                     {
        //                                         $filter: {
        //                                             input: '$sku_info',
        //                                             as: 'sku',
        //                                             cond: {
        //                                                 $eq: ['$$product.productId', '$$sku_info.skuId']
        //                                             }
        //                                         }
        //                                     }
        //                                 ]
        //                             }
        //                         }
        //                     ]
        //                 }
        //             }
        //         }
        //     }
        // }
const getAllOrder = async({ userId, limit, page }) => {
    const skip = (page - 1) * limit
    const filter = {order_userId: convertToObjectIdMongodb(userId)}
    const orders = await ORDER.aggregate([
        {
            $match: filter
        },
        {
            $addFields: {
                order_cancellation: {
                    $cond: {
                        if: { $eq: ["$order_cancellation", null] },
                        then: "$$REMOVE",
                        else: "$order_cancellation"
                    }
                }
            }
        },
        {
            $project: {
                order_note: 0,
                createdOn: 0,
                modifiedOn: 0,
                __v: 0,
                _id: 0,
                order_userId: 0
            }
        },
        {
            $lookup: {
                from: 'Shops',
                localField: 'order_products.shopId',
                foreignField: '_id',
                as: 'shop_info'
            }
        },
        {
            $addFields: {
                order_products: {
                    $map: {
                        input: '$order_products',
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
            $project: {
                'order_products.shopId': 0,
                'order_products.shop_info.shop_address': 0,
                'order_products.shop_info.shop_email': 0,
                'order_products.shop_info.shop_phone': 0,
                'order_products.shop_info.shop_status': 0,
                'order_products.shop_info.shop_verify': 0,
                'order_products.shop_info.shop_description': 0,
                'order_products.shop_info.shop_type': 0,
                'order_products.shop_info.shop_rattings': 0,
                'order_products.shop_info.createdAt': 0,
                'order_products.shop_info.updatedAt': 0,
                'order_products.shop_info.__v': 0,
            }
        },
        {
            $lookup: {
                from: 'Skus',
                localField: 'order_products.item_products.productId',
                foreignField: 'skuId',
                as: 'sku_info'
            }
        },
        {
            $addFields: {
                order_products: {
                    $map: {
                        input: '$order_products',
                        as: 'order_product',
                        in: {
                            $mergeObjects: [
                                '$$order_product',
                                {
                                    item_products: {
                                        $cond: {
                                            if: {
                                                $isArray: '$$order_product.item_products',
                                            },
                                            then: {
                                                $map: {
                                                    input: '$$order_product.item_products',
                                                    as: 'item_product',
                                                    in: {
                                                        $mergeObjects: [
                                                            '$$item_product',
                                                            {
                                                                $arrayElemAt: [
                                                                    {
                                                                        $filter: {
                                                                            input: '$sku_info',
                                                                            as: 'sku',
                                                                            cond: { $eq: ['$$item_product.productId', '$$sku.skuId']}
                                                                        }
                                                                    },
                                                                    0
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            else: []
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
                'order_products.item_products._id': 0,
                'order_products.item_products.sku_default': 0,
                'order_products.item_products.sku_slug': 0,
                'order_products.item_products.sku_price': 0,
                'order_products.item_products.isDraft': 0,
                'order_products.item_products.isPublished': 0,
                'order_products.item_products.isDeleted': 0,
                'order_products.item_products.createdAt': 0,
                'order_products.item_products.updatedAt': 0,
                'order_products.item_products.__v': 0,
            }
        },
        {
            $lookup: {
                from: 'Spus',
                localField: 'order_products.item_products.productId',
                foreignField: '_id',
                as: 'spu_info'
            }
        },
        {
            $addFields: {
                order_products: {
                    $map: {
                        input: '$order_products',
                        as: 'order_product',
                        in: {
                            $mergeObjects: [
                                '$$order_product',
                                {
                                    item_products: {
                                        $cond: {
                                            if: {
                                                $isArray: '$$order_product.item_products',
                                            },
                                            then: {
                                                $map: {
                                                    input: '$$order_product.item_products',
                                                    as: 'item_product',
                                                    in: {
                                                        $mergeObjects: [
                                                            '$$item_product',
                                                            {
                                                                $arrayElemAt: [
                                                                    {
                                                                        $filter: {
                                                                            input: '$spu_info',
                                                                            as: 'spu',
                                                                            cond: { $eq: ['$$item_product.productId', '$$spu._id']}
                                                                        }
                                                                    },
                                                                    0
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            },
                                            else: []
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
                'order_products.item_products.product_shop': 0,
                'order_products.item_products.product_price': 0,
                'order_products.item_products.product_description': 0,
                'order_products.item_products._id': 0,
                'order_products.item_products.product_min_price': 0,
                'order_products.item_products.product_max_price': 0,
                'order_products.item_products.product_category': 0,
                'order_products.item_products.product_quantity': 0,
                'order_products.item_products.isDraft': 0,
                'order_products.item_products.isPublished': 0,
                'order_products.item_products.isDeleted': 0,
                'order_products.item_products.createdAt': 0,
                'order_products.item_products.updatedAt': 0,
                'order_products.item_products.__v': 0,
            }
        },
        { $skip: skip},
        { $limit: limit}
    ]);
    const totalOrders = await ORDER.countDocuments(filter)
    return {
        data: orders,
        limit,
        page,
        totalPages: Math.ceil(totalOrders / limit)
    }
}

const getOneOrderByUser = async({ userId, orderId }) => {
    return await ORDER.findOne({
        order_userId: userId,
        _id: convertToObjectIdMongodb(orderId)
    })
}

const cancelOrder = async({ userId, orderId }) => {

}

module.exports = {
    createOrder,
    getOrderByUser,
    getAllOrder,
    getOneOrderByUser
}