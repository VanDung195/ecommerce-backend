'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const ORDER = require('../order.model')

const createOrder = async({
    _id,
    userId,
    order_checkout,
    shipping,
    payment,
    order_products,
    order_note,
    order_cancellation
}) => {
    const order = await ORDER.create({
        _id,
        order_userId: userId,
        order_checkout,
        order_shipping: shipping,
        order_payment: payment,
        order_products,
        order_cancellation,
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
const getAllOrderByUser = async({ userId, status, limit, page }) => {
    const skip = (page - 1) * limit
    const filter = {order_userId: convertToObjectIdMongodb(userId)}
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
            $project: {
                order_note: 0,
                modifiedOn: 0,
                __v: 0,
                order_userId :0
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
            $unset: 'shop_info'
        },
        {
            $addFields: {
                shop_info: {
                    $cond: {
                        if: { $eq: ['$role', 'shop']},
                        then: '$$REMOVE',
                        else: '$shop_info'
                    }
                }
            }
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
                                    as: 'product',
                                    in: {
                                        $mergeObjects: [
                                            '$$product',
                                            {
                                                $cond: {
                                                    if: {
                                                        $gt: [{ $size: { $ifNull: ['$$product.product_variations', []] }}, 0]
                                                    },
                                                    then: {
                                                        seleted_options: {
                                                            $map: {
                                                                input: { $range: [0, { $size: '$$product.product_variations'}]},
                                                                as: 'i',
                                                                in: {
                                                                    tier_id: {
                                                                        $arrayElemAt: ['$$product.product_variations.name', '$$i']
                                                                    },
                                                                    tier_value: {
                                                                        $arrayElemAt: [
                                                                            { $arrayElemAt: ['$$product.product_variations.options', '$$i']},
                                                                            { $arrayElemAt: ['$$product.sku_tier_idx', '$$i']}
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    else: {}
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

const getAllOrderByShop = async({ shopId, status, limit, page }) => {
    const skip = (page - 1) * limit
    const filter = { 'order_products.shopId': shopId}
    if(status !== 'all'){
        filter.order_status = status
    }   
    const orders = await ORDER.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: 'Users',
                localField: 'order_userId',
                foreignField: '_id',
                as: 'user_info'
            }
        },
        {
            $unwind: '$user_info'
        },
        {
            $project: {
                order_userId: 0,
                order_note: 0,
                order_status_history: 0,
                modifiedOn: 0,
                __v: 0,
                'user_info.usr_email': 0,
                'user_info.usr_password': 0,
                'user_info.usr_sex': 0,
                'user_info.usr_avatar': 0,
                'user_info.usr_day_of_birth': 0,
                'user_info.usr_role': 0,
                'user_info.usr_status': 0,
                'user_info.createdAt': 0,
                'user_info.updatedAt': 0,
                'user_info.usr_slug': 0,
                'user_info.__v': 0,
            }
        },
        {
            $addFields: {
                first_two_products: { $slice: ['$order_products.item_products', 2]},
                total_products: { $size: '$order_products.item_products'},
                remaining_products: { $subtract: [{ $size: '$order_products.item_products'}, 2]},
            }
        },
        {
            $project: {
                order_products: 0
            }
        },
        {
            $lookup: {
                from: 'Skus',
                localField: 'first_two_products.productId', //skuId
                foreignField: 'skuId',
                as: 'sku_info'
            }
        },
        {
            $addFields: {
                first_two_products: {
                    $map: {
                        input: '$first_two_products',
                        as: 'product',
                        in: {
                            $mergeObjects: [
                                '$$product',
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$sku_info',
                                                as: 'sku',
                                                cond: { $eq: ['$$product.productId', '$$sku.skuId']}
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
        },
        { $unset: 'sku_info' },
        {
            $project: {
                'first_two_products._id': 0,
                'first_two_products.sku_default': 0,
                'first_two_products.sku_price': 0,
                'first_two_products.sku_stock': 0,
                'first_two_products.isDraft': 0,
                'first_two_products.isPublished': 0,
                'first_two_products.isDeleted': 0,
                'first_two_products.createdAt': 0,
                'first_two_products.updatedAt': 0,
                'first_two_products.__v': 0,
                'first_two_products.sku_slug': 0,

            }
        },
        {
            $lookup: {
                from: 'Spus',
                localField: 'first_two_products.productId', //spuId
                foreignField: '_id',
                as: 'spu_info'
            }
        },
        {
            $addFields: {
                first_two_products: {
                    $map: {
                        input: '$first_two_products',
                        as: 'product',
                        in: {
                            $mergeObjects: [
                                '$$product',
                                {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$spu_info',
                                                as: 'spu',
                                                cond: { $eq: ['$$product.productId', '$$spu._id']}
                                            }
                                        },
                                        0
                                    ]
                                },
                            ]
                        }
                    }
                },
            }
        }, 
        { $unset: 'spu_info'},
        {
            $project: {
                'first_two_products._id': 0,
                'first_two_products.product_description': 0,
                'first_two_products.product_price': 0,
                'first_two_products.product_min_price': 0,
                'first_two_products.product_max_price': 0,
                'first_two_products.product_category': 0,
                'first_two_products.product_quantity': 0, //total_quantity
                'first_two_products.product_shop': 0,
                'first_two_products.product_variations.images': 0,
                'first_two_products.isDraft': 0,
                'first_two_products.isPublished': 0,
                'first_two_products.createdAt': 0,
                'first_two_products.updatedAt': 0,
                'first_two_products.isDeleted': 0,
                'first_two_products.__v': 0,

            }
        },
        {
            $addFields: {
                first_two_products: {
                    $map: {
                        input: '$first_two_products',
                        as: 'product',
                        in: {
                            $mergeObjects: [
                                '$$product',
                                {
                                    $cond: {
                                        if: {
                                            $gt: [{ $size: { $ifNull: ['$$product.product_variations', []]}}, 0]
                                        },
                                        then: {
                                            selected_options: {
                                                $map: {
                                                    input: { $range: [0, { $size: '$$product.product_variations' }] }, // Lặp qua từng index
                                                    as: 'i',
                                                    in: {
                                                        tier_id: {
                                                            $arrayElemAt: ['$$product.product_variations.name', '$$i']
                                                        },
                                                        tier_value: {
                                                            $arrayElemAt: [
                                                                { $arrayElemAt: ['$$product.product_variations.options', '$$i'] },
                                                                { $arrayElemAt: ['$$product.sku_tier_idx', '$$i'] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        else: {}
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        { $skip: skip },
        { $limit: limit }
    ])
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

const getOrderDetailByUser = async({ userId, orderId }) => {
    const filter = {
        order_userId: convertToObjectIdMongodb(userId),
        _id: convertToObjectIdMongodb(orderId)
    }
    const order = await ORDER.aggregate([
        {
            $match: filter
        },
        {
            $project: {
                _id: 0,
                order_userId: 0,
                modifiedOn: 0,
                __v: 0
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
            $project: {
                'order_products.shopId': 0,
                'shop_info.userId': 0,
                'shop_info.shop_email': 0,
                'shop_info.shop_phone': 0,
                'shop_info.shop_verify': 0,
                'shop_info.shop_status': 0,
                'shop_info.shop_description': 0,
                'shop_info.shop_type': 0,
                'shop_info.shop_rattings': 0,
                'shop_info.createdAt': 0,
                'shop_info.updatedAt': 0,
                'shop_info.__v': 0,
            }
        },
        {
            $lookup: {
                from: 'Skus',
                localField: 'order_products.item_products.productId', //skuId
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
                                    as: 'product',
                                    in: {
                                        $mergeObjects: [
                                            '$$product',
                                            {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: '$sku_info',
                                                            as: 'sku',
                                                            cond: { $eq: ['$$product.productId', '$$sku.skuId']}
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
        { $unset: 'sku_info'},
        {
            $project: {
                'order_products.item_products._id': 0,
                'order_products.item_products.sku_default': 0,
                'order_products.item_products.sku_slug': 0,
                'order_products.item_products.sku_price': 0,
                'order_products.item_products.sku_stock': 0,
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
                localField: 'order_products.item_products.productId', //spuId
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
                                    as: 'product',
                                    in: {
                                        $mergeObjects: [
                                            '$$product',
                                            {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: '$spu_info',
                                                            as: 'spu',
                                                            cond: { $eq: ['$$product.productId', '$$spu._id']}
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
        { $unset: 'spu_info' },
        {
            $project: {
                'order_products.item_products._id': 0,
                'order_products.item_products.product_description': 0,
                'order_products.item_products.product_price': 0,
                'order_products.item_products.product_min_price': 0,
                'order_products.item_products.product_max_price': 0,
                'order_products.item_products.product_category': 0,
                'order_products.item_products.product_quantity': 0,
                'order_products.item_products.product_shop': 0,
                'order_products.item_products.product_variations.images': 0,
                'order_products.item_products.isDraft': 0,
                'order_products.item_products.isPublished': 0,
                'order_products.item_products.createdAt': 0,
                'order_products.item_products.updatedAt': 0,
                'order_products.item_products.__v': 0,
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
                                    as: 'product',
                                    in: {
                                        $mergeObjects: [
                                            '$$product',
                                            {
                                                $cond: {
                                                    if: {
                                                        $gt: [{ $size: { $ifNull: ['$$product.product_variations', []] }}, 0]
                                                    },
                                                    then: {
                                                        seleted_options: {
                                                            $map: {
                                                                input: { $range: [0, { $size: '$$product.product_variations'}]},
                                                                as: 'i',
                                                                in: {
                                                                    tier_id: {
                                                                        $arrayElemAt: ['$$product.product_variations.name', '$$i']
                                                                    },
                                                                    tier_value: {
                                                                        $arrayElemAt: [
                                                                            { $arrayElemAt: ['$$product.product_variations.options', '$$i']},
                                                                            { $arrayElemAt: ['$$product.sku_tier_idx', '$$i']}
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    else: {}
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
    ])
    return order
}

const getOrderDetailByShop = async({ shopId, orderId }) => {
    const filter = {
        'order_products.shopId': shopId,
        _id: convertToObjectIdMongodb(orderId)
    }
    const order = await ORDER.aggregate([
        {
            $match: filter,
        },
        {
            $lookup: {
                from: 'Users',
                localField: 'order_userId',
                foreignField: '_id',
                as: 'user_info'
            }
        },
        {
            $project: {
                order_userId: 0,
                modifiedOn: 0,
                __v: 0,
                'order_products.shopId': 0,
                'user_info.usr_email': 0, 
                'user_info.usr_password': 0, 
                'user_info.usr_phone': 0, 
                'user_info.usr_sex': 0, 
                'user_info.usr_avatar': 0, 
                'user_info.usr_day_of_birth': 0, 
                'user_info.usr_role': 0, 
                'user_info.usr_status': 0, 
                'user_info.createdAt': 0, 
                'user_info.updatedAt': 0, 
                'user_info.__v': 0, 
                'user_info._id': 0, 
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
                                    as: 'product',
                                    in: {
                                        $mergeObjects: [
                                            '$$product',
                                            {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: '$sku_info',
                                                            as: 'sku',
                                                            cond: { $eq: ['$$sku.skuId', '$$product.productId']}
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
        { $unset: 'sku_info'},
        {
            $project: {
                'order_products.item_products._id': 0,
                'order_products.item_products.sku_default': 0,
                'order_products.item_products.sku_slug': 0,
                'order_products.item_products.sku_price': 0,
                'order_products.item_products.sku_stock': 0,
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
                                    as: 'product',
                                    in: {
                                        $mergeObjects: [
                                            '$$product',
                                            {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: '$spu_info',
                                                            as: 'spu',
                                                            cond: { $eq: ['$$spu._id', '$$product.productId']}
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
        { $unset: 'spu_info'},
        {
            $project: {
                'order_products.item_products._id': 0,
                'order_products.item_products.product_description': 0,
                'order_products.item_products.product_price': 0,
                'order_products.item_products.product_min_price': 0,
                'order_products.item_products.product_max_price': 0,
                'order_products.item_products.product_category': 0,
                'order_products.item_products.product_quantity': 0,
                'order_products.item_products.product_shop': 0,
                'order_products.item_products.product_variations.images': 0,
                'order_products.item_products.isDraft': 0,
                'order_products.item_products.isPublished': 0,
                'order_products.item_products.createdAt': 0,
                'order_products.item_products.updatedAt': 0,
                'order_products.item_products.__v': 0,
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
                                    as: 'product',
                                    in: {
                                        $mergeObjects: [
                                            '$$product',
                                            {
                                                $cond: {
                                                    if: {
                                                        $gt: [{ $size: { $ifNull: ['$$product.product_variations', []] }}, 0]
                                                    },
                                                    then: {
                                                        seleted_options: {
                                                            $map: {
                                                                input: { $range: [0, { $size: '$$product.product_variations'}]},
                                                                as: 'i',
                                                                in: {
                                                                    tier_id: {
                                                                        $arrayElemAt: ['$$product.product_variations.name', '$$i']
                                                                    },
                                                                    tier_value: {
                                                                        $arrayElemAt: [
                                                                            { $arrayElemAt: ['$$product.product_variations.options', '$$i']},
                                                                            { $arrayElemAt: ['$$product.sku_tier_idx', '$$i']}
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    else: {}
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
    ])
    return order
}
const confirmOrderCancellation = async({ shopId, orderId }) => {
    const filter = {
        'order_products.shopId': shopId,
        _id: convertToObjectIdMongodb(orderId)
    }, update = {
        $set: {
            order_status: 'cancelled',
            'order_cancellation.shop_approval': 'approved',
            'order_cancellation.approvedAt': new Date,
        },
        $addToSet: {
            order_status_history: {
                status: 'cancelled',
                changedAt: new Date()
            }
        }
    }, option = { new: true }
    return await ORDER.findOneAndUpdate(filter, update, option)
}

const rejectOrderCancellation = async({ shopId, orderId, code, detail }) => {
    const filter = {
        'order_products.shopId': shopId,
        _id: convertToObjectIdMongodb(orderId)
    }, update = {
        $set: {
            'order_cancellation.shop_approval': 'reject',
            'shop_reason.code': code,
            'shop_reason.detail': detail
        }
    }, option = { new: true }
    return await ORDER.findOneAndUpdate(filter, update, option)
}

module.exports = {
    createOrder,
    getOrderByUser,
    getAllOrderByUser,
    getOneOrderByUser,
    cancelOrder,
    updateOrderStatusHistory,
    getOneOrderByShop,
    getAllOrderByShop,
    getOrderDetailByUser,
    getOrderDetailByShop,
    confirmOrderCancellation,
    rejectOrderCancellation
}