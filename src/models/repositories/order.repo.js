'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const ORDER = require('../order.model')

const createOrder = async({
    userId,
    order_checkout,
    shipping,
    payment,
    order_products,
    order_note,
    order_cancellation = null
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
const getAllOrder = async({ id, role = 'user', status, limit, page }) => {
    const skip = (page - 1) * limit
    const filterKey = role === 'shop' ? 'order_products.shopId' : 'order_userId'
    const filter = {[filterKey]: convertToObjectIdMongodb(id)}
    if(status !== 'all'){
        filter.order_status = status
    }
    const orders = await ORDER.aggregate([
        {
            $match: filter
        },
        {
            $addFields: {
                order_cancellation: {
                    $cond: {
                        if: { $eq: ['$order_cancellation', null]},
                        then: '$$REMOVE',
                        else: '$order_cancellation'
                    }
                }
            }
        },
        {
            $addFields: {
                role: role
            }  
        },
        {
            $project: {
                order_note: 0,
                modifiedOn: 0,
                __v: 0,
            }
        }, 
        {
            $addFields: {
                order_userId: {
                    $cond: {
                        if: { $eq: ['$role', 'shop']},
                        then: '$order_userId',
                        else: '$$REMOVE'
                    }
                }
            }
        },
        {
            $unset: 'role'
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
                    $mergeObjects: [
                        '$order_products',
                        {
                            shop_info: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$shop_info',
                                            as: 'shop',
                                            cond: { $eq: ['$$shop._id', '$order_products.shopId']}
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    ]
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
                    $mergeObjects: [
                        '$order_products',
                        {
                            item_products: {
                                $map: {
                                    input: '$order_products.item_products',
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
                            }
                        }
                    ]
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
                    $mergeObjects: [
                        '$order_products',
                        {
                            item_products: {
                                $map: {
                                    input: '$order_products.item_products',
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
                            }
                        }
                    ]
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
                'order_products.item_products.product_variations.images': 0,
                order_status_history: 0
            }
        },
        { $skip: skip },
        { $limit: limit }
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

const getOneOrderByShop = async({ shopId, orderId }) => {
    return await ORDER.findOne({
        'order_products.shopId': shopId,
        _id: convertToObjectIdMongodb(orderId)
    })
}

const cancelOrder = async({ userId, orderId, cancellation_info, order_status }) => {
    const filter = {
        order_userId: userId,
        _id: convertToObjectIdMongodb(orderId)
    }, update = {
        $set: {
            order_cancellation: cancellation_info
        }
    }, option = { new: true }
    const cancelledOrder = await ORDER.findOneAndUpdate(filter, update, option)

    return cancelledOrder
}

const updateOrderStatusHistory = async({ userId, orderId, status }) => {
    const filter = {
        order_userId: userId,
        _id: convertToObjectIdMongodb(orderId)
    }, update = {
        $addToSet: {
            order_status_history: {
                status,
                changedAt: new Date()
            }
        }
    }, option = { new: true }
    //status = cancelled
    if(status === 'pending'){
        update.$set.order_status = status
    }
    return await ORDER.findOneAndUpdate(filter, update, option)
}
// const confirmCancelledOrder = async({ shopId, orderId }) => {
//     const filter = {
//         'order_products.shopId': shopId,
//         _id: convertToObjectIdMongodb(orderId)
//     }, update = {

//     }
// }

module.exports = {
    createOrder,
    getOrderByUser,
    getAllOrder,
    getOneOrderByUser,
    cancelOrder,
    updateOrderStatusHistory,
    getOneOrderByShop
}