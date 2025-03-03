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
        // {
        //     $addFields: {
        //         'order_products.item_products': {
        //             $map: {
        //                 input: '$order_products.item_products',
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
        //                                                 $eq: ['$$product.productId', '$$sku.skuId']
        //                                             }
        //                                         }
        //                                     },
        //                                     0
        //                                 ]
        //                             }    
        //                         }
        //                     ]
        //                 }
        //             }
        //         }
        //     }
        // }
    ]);
    return orders
}
// const totalOrders = await ORDER.countDocuments(filter)
// return {
//     data: orders,
//     limit,
//     page,
//     totalPages: Math.ceil(totalOrders / limit)
// }

module.exports = {
    createOrder,
    getOrderByUser,
    getAllOrder
}