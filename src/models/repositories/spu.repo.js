'use strict'

const { convertToObjectIdMongodb, getSelectData, unSelectData } = require('../../utils')
const SPU = require('../spu.model')

const createSpu = async({
    shop,
    name,
    thumb,
    description,
    price,
    category,
    quantity,
    variations
}) => {
    const spu = await SPU.create({
        product_name: name,
        product_thumb: thumb,
        product_description: description,
        product_price: price,
        product_category: category,
        product_quantity: quantity,
        product_shop: shop,
        product_variations: variations
    })
    return spu
}

const getOneSpuById = async({
    shop,
    spuId
}) => {
    const spu = await SPU.findOne({
        product_shop: shop,
        _id: convertToObjectIdMongodb(spuId)
    })
    return spu
}

const getOneSpuBySlug = async(slug) => {
    const spu = await SPU.findOne({
        product_slug: slug
    })
    .select(unSelectData(['isDeleted', 'createdAt', 'updatedAt', '__v']))
    .lean()
    return spu
}


const getAllSpu = async({
    limit,
    page,
    search,
    unSelect = []
}) => {
    const filter = {}
    if(search){
        filter.product_name = { $regex: search, $options: 'i'}
    }
    const skip = (page - 1) * limit
    const spus = await SPU.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .select(unSelectData(unSelect))
                    .lean()
    const total = await SPU.countDocuments(filter)
    return {
        data: spus,
        pagination: {
            total: total,
            limit: limit,
            page: page,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const publishProductByShop = async({
    product
}) => {
    const { modifiedCount } = await SPU.updateOne(
        {
            _id: product._id
        },
        {
            $set: {
                isDraft: product.isDraft,
                isPublished: product.isPublished
            }
        }
    )
    return modifiedCount
}

const unPublishProductByShop = async({
    product
}) => {
    const { modifiedCount } = await SPU.updateOne(
        {
            _id: product._id
        },
        {
            $set: {
                isDraft: product.isDraft,
                isPublished: product.isPublished
            }
        }
    )
    return modifiedCount
}

const queryProduct = async({
    query,
    limit,
    page,
    unSelect = []
}) => {
    const skip = (page - 1) * limit
    const spus = await SPU.find(query)
                    .populate('product_shop', 'shop_name shop_email -_id')
                    .sort({
                        updatedAt: -1
                    })
                    .skip(skip)
                    .limit(limit)
                    .select(unSelectData(unSelect))
                    .lean()
    const total = await SPU.countDocuments(query)
    return {
        data: spus,
        pagination: {
            total,
            limit,
            page,
            totalPages: Math.ceil(total / limit)
        }
    }
}

//update khi sử số lượng hoặc giá của sku
const updateQuantity = async({
    productId
}) => {

}

const updatePriceRange = async({
    productId,
    min_price,
    max_price
}) => {
    
}

const updateInventoryStockSpu = async({
    shop,
    spuId,
    stock
}) => {
    const filter = {

    },
    update = {
        $set: {
            inven_stock: stock
        }
    }, 
    options = {
        new: true
    }
    const spu = await SPU.findOneAndUpdate()
}

const updateSpu = async({

}) => {

}

const deleteSpu = async({
    shopId,
    spuId
}) => {

}

module.exports = {
    createSpu,
    getOneSpuById,
    getOneSpuBySlug,
    getAllSpu,
    publishProductByShop,
    unPublishProductByShop,
    queryProduct
}