'use strict'

const { convertToObjectIdMongodb, getSelectData, unSelectData } = require('../../utils')
const SPU = require('../spu.model')
const { getTotalInvenStockAndPriceSku } = require('./sku.repo')

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

const getSpusByListSpuId = async({
    spuIds = [],
    selectData = []
}) => {
    const spus = await SPU.find({
        _id: {
            $in: spuIds
        }
    }).select(getSelectData(selectData)).lean()
    return spus
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
const updateInvenStockSpu = async({
    productId,
    quantity
}) => {
    const spuObjectId = convertToObjectIdMongodb(productId)
    const spu = await SPU.findOneAndUpdate(
        {
            _id: spuObjectId
        },
        {
            $set: {
                product_quantity: quantity
            }
        },
        {
            new: true
        }
    )
    return spu
}


const updatePriceRange = async({
    productId,
    min_price,
    max_price
}) => {
    const spuObjectId = convertToObjectIdMongodb(productId)
    const spu = await SPU.findOneAndUpdate(
        {
            _id: spuObjectId
        },
        {
            $set: {
                product_min_price: +min_price,
                product_max_price: +max_price
            }
        },
        {
            new: true
        }
    )
    return spu
}

//Product have variations
const updateInvenStockAndPrice = async({
    productId,
}) => {
    const spuObjectId = convertToObjectIdMongodb(productId)
    const result = await getTotalInvenStockAndPriceSku({ productId: spuObjectId})

    let totalQuantity = result.totalQuantity
    let minPrice = 1
    let maxPrice = 1
    if(result !== undefined){
        // totalQuantity = result.totalQuantity
        minPrice = result.minPrice
        maxPrice = result.maxPrice
    }
    const spu = await SPU.findOneAndUpdate(
        {
            _id: spuObjectId
        },
        {
            $set: {
                product_quantity: totalQuantity,
                product_min_price: minPrice,
                product_max_price: maxPrice
            }
        },
        {
            new: true
        }
    )
    return spu
}

//Product has no variations
const updateInventoryStockSpu = async({
    shopId,
    spuId,
    stock
}) => {
    const shopObjectId = convertToObjectIdMongodb(shopId),
        productObjectId = convertToObjectIdMongodb(spuId)
    const filter = {
        product_shop: shopObjectId,
        _id: productObjectId
    },
    update = {
        $set: {
            inven_stock: stock
        }
    }, 
    options = {
        new: true
    }
    const spu = await SPU.findOneAndUpdate(filter, update, options)
    return spu
}

//update simple product
const updateSimpleSpu = async({
    shopId,
    spuId,
    name,
    thumb,
    description,
    price,
    category,
    quantity
}) => {
    const shopObjectId = convertToObjectIdMongodb(shopId),
        productObjectId = convertToObjectIdMongodb(spuId),
        filter = {
            _id: productObjectId,
            product_shop: shopObjectId
        },
        update = {
            product_name: name,
            product_thumb: thumb,
            product_description: description,
            product_price: price,
            product_category: category,
            product_quantity: quantity
        },
        options = {
            new: true
        }
    const spu = await SPU.findOneAndUpdate(filter, update, options)
    return spu
}
const addVariation = async({
    shopId,
    spuId,
    images,
    name,
    options,
}) => {
    const shopObjectId = convertToObjectIdMongodb(shopId),
        productObjectId = convertToObjectIdMongodb(spuId),
        filter = {
            _id: productObjectId,
            product_shop: shopObjectId
        }
    const spu = await SPU.findOneAndUpdate(
        filter,
        {
            $push: {
                product_variations: {
                    images,
                    name,
                    options
                }
            }
        },
        {
            new: true,
        }
    )
    return spu
}

const deleteVariation = async({
    shopId,
    spuId,
    variation_name
}) => {
    const shopObjectId = convertToObjectIdMongodb(shopId),
        productObjectId = convertToObjectIdMongodb(spuId),
        filter = {
            _id: productObjectId,
            product_shop: shopObjectId
        },
        variationNameRegex = new RegExp(variation_name, 'i')
    const delVariation = await SPU.findOneAndUpdate(
        filter,
        {
            $pull: {
                product_variations: {
                    name: variationNameRegex
                }
            }
        },
        {
            new: true,
        }
    )
    return delVariation
}

const deleteSpu = async({
    shopId,
    spuId
}) => {
    const shopObjectId = convertToObjectIdMongodb(shopId),
            spuObjectId = convertToObjectIdMongodb(spuId)
    const delSpu = await SPU.deleteOne({
        _id: spuObjectId,
        product_shop: shopObjectId
    })
    return delSpu.deletedCount
}

const updateVariationOptions = async({
    shopId,
    spuId,
    variationIdx,
    variationName,
    variationOptions,
}) => {
    const spuObjectId = convertToObjectIdMongodb(spuId)
    return await SPU.findOneAndUpdate(
        {
            _id: spuObjectId,
            product_shop: shopId,
            [`product_variations.${variationIdx}.name`]: variationName
        },
        {
            $set: {
                [`product_variations.${variationIdx}.options`]: variationOptions
            }
        },
        {
            new: true,
            runValidators: true
        }
    )
}

module.exports = {
    createSpu,
    deleteSpu,
    getOneSpuById,
    getOneSpuBySlug,
    getAllSpu,
    publishProductByShop,
    unPublishProductByShop,
    queryProduct,
    updateInvenStockSpu,
    updatePriceRange,
    updateInvenStockAndPrice,
    deleteVariation,
    addVariation,
    updateVariationOptions,
    getSpusByListSpuId
}