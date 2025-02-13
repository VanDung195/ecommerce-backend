'use strict'

const DISCOUNT = require('../discount.model')
const { convertToObjectIdMongodb, unSelectData } = require('../../utils/index')

const createDiscountByShop = async ({
    shopId,
    discount
}) => {
    const {
        name, description, type, max_amount, value, code, start_date, end_date, max_uses,
        max_use_per_user, min_order_value, applies_to, productIds = []
    } = discount

    const newDiscount = await DISCOUNT.create({
        discount_name: name,
        discount_description: description,
        discount_type: type,
        discount_max_amount: max_amount,
        discount_value: value,
        discount_code: code,
        discount_start_date: start_date,
        discount_end_date: end_date,
        discount_max_uses: max_uses,
        discount_max_use_per_user: max_use_per_user,
        discount_min_order_value: min_order_value,
        discount_shopId: shopId,
        discount_applies_to: applies_to,
        discount_productIds: productIds
    })
    return newDiscount
}

const getAllDiscountByShop = async ({
    shopId,
    page,
    limit
}) => {
    const offset = (page - 1) * limit
    const discounts = await DISCOUNT.find({
        discount_shopId: convertToObjectIdMongodb(shopId),
        isDeleted: false
    })
    .limit(limit)
    .offset(offset)
    .lean()
    return discounts
}

const getRecommendShopDiscount = async ({ userId, shopId, products }) => {
    const discounts = await DISCOUNT.aggregate([
        {
            $match: {
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        },
        {
            $addFields: {
                products: products,
                user_usage_count: {
                    $size: {
                        $filter: {
                            input: "$discount_user_used",
                            as: "used",
                            cond: { $eq: ["$$used", userId] }
                        }
                    }
                }
            }
        },
        {
            $project: {
                discount_name: 1,
                discount_description: 1,
                discount_type: 1,
                discount_value: 1,
                discount_code: 1,
                discount_start_date: 1,
                discount_end_date: 1,
                discount_max_uses: 1,
                discount_uses_count: 1,
                discount_max_use_per_user: 1,
                discount_min_order_value: 1,
                discount_applies_to: 1,
                discount_productIds: 1,
                products: 1,
                user_usage_count: 1,
                is_valid: {
                    $lt: ["$user_usage_count", "$discount_max_use_per_user"]
                },
                applicable_products: {
                    $cond: {
                        if: { $eq: ["$discount_applies_to", "specific"] },
                        then: {
                            $filter: {
                                input: "$products",
                                as: "product",
                                cond: { $in: ["$$product", "$discount_productIds"] }
                            }
                        },
                        else: "$products"
                    }
                }
            }
        }
    ]);
    return discounts;
};

//cần check số tiền tối thiểu 
const getRecommendDiscount = async({ userId, shopId, products, totalPrice}) => {
    const now = new Date()
    const discounts = await DISCOUNT.aggregate([
        {
            $match: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_start_date: {
                    $lte: now // <=
                },
                discount_end_date: {
                    $gte: now // >=
                },
                // $or: [
                //     { discount_min_order_value: 0},
                //     { discount_min_order_value: { $lte: totalPrice}}
                // ]
            }
        },
        {
            $addFields: {
                products: products,
                userId: userId,
                totalPrice: totalPrice
            }
        },
        {
            $addFields: {
                user_usage_count: {
                    $size: {
                        $filter: {
                            input: '$discount_user_used',
                            as: 'user_used',
                            cond: { $eq: ['$$user_used', userId]}
                        }
                    }
                },
                applicable_products: {
                    $cond: {
                        if: { $eq: ['$discount_applies_to', 'specific']},
                        then: {
                            $filter: {
                                input: '$products',
                                as: 'product',
                                cond: { $in: ['$$product', '$discount_productIds']}
                            }
                        }, 
                        else: '$products'
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                discount_name: 1,
                discount_description: 1,
                discount_type: 1,
                discount_value: 1,
                discount_code: 1,
                discount_start_date: 1,
                discount_end_date: 1,
                discount_max_uses: 1,
                discount_uses_count: 1,
                discount_max_use_per_user: 1,
                discount_min_order_value: 1,
                discount_applies_to: 1,
                discount_productIds: 1,
                products_input: products,
                discount_user_used: 1,
                user_usage_count: 1,
                'is_valid': {
                    $and: [
                        { $lt: ['$user_usage_count', '$discount_max_use_per_user'] },
                        { $gt: [{ $size: '$applicable_products' }, 0] },
                        { $lte: ['$discount_min_order_value', totalPrice]},
                        { $lte: ['$discount_uses_count', '$discount_max_uses']}
                    ]
                },
                applicable_products: 1,
                userId: 1,
                totalPrice: 1
            }
        }
    ])
    return discounts
}

//freeship, ...
const getRecommendPlatformDiscount = async ({

}) => {

}

const checkValidDiscount = async({

}) => {
    
}

const getOneDiscountCode = async ({
    shopId,
    code,
    unSelect = []
}) => {
    const discount = await DISCOUNT.findOne(
        {
            discount_shopId: convertToObjectIdMongodb(shopId),
            discount_code: code,
            // discount_code: { $regex: new RegExp(`^${code}$`, 'i') }, 
        }
    ).select(unSelectData(unSelect)).lean()
    return discount
}

module.exports = {
    getOneDiscountCode,
    createDiscountByShop,
    getRecommendShopDiscount,
    getRecommendDiscount,
    getAllDiscountByShop
}