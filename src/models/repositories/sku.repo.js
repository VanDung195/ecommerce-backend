'use strict'

const SKU = require('../sku.model')
const { convertToObjectIdMongodb, unSelectData } = require('../../utils/index')
const { addStockToInventory } = require('./inventory.repo')

const createSku = async({
    spuId,
    sku_list,
    shopId
}) => {
    try {
        const convertSkuList = sku_list.map( sku => {
            return {
                ...sku,
                skuId: `${spuId}${Math.floor(100 + Math.random() * 900)}-${shopId}`,
                productId: spuId
            }
        })
        const sku = await SKU.create(convertSkuList)
        return sku
    } catch (error) {
        console.error(error)
        return error
    }
}

const createOneSku = async({
    shopId,
    spuId,
    sku_tier_idx,
    sku_price,
    sku_stock
}) => {
    const newSku = await SKU.create({
        skuId: `${spuId}${Math.floor(100 + Math.random() * 900)}-${shopId}`,
        sku_tier_idx,
        sku_price,
        sku_stock,
        productId: convertToObjectIdMongodb(spuId)
    })
    return newSku
}

const getAllSkuBySpuId = async({
    spuId,
    unSelect = []
}) => {
    const sku = await SKU.find({
        productId: spuId
    }).select(unSelectData(unSelect)).lean()
    
    return sku
}

const getOneSku = async({
    spuId,
    skuId,
    unSelect = []
}) => {
    const sku = await SKU.findOne({
        productId: convertToObjectIdMongodb(spuId),
        skuId
    })
    .populate('productId', 'product_shop -_id')
    .select(unSelectData(unSelect))
    .lean()
    return sku
}

const getTotalInvenStockAndPriceSku = async({
    productId
}) => {
    const productObjectId = convertToObjectIdMongodb(productId)
    const result = await SKU.aggregate([
        {
            $match: {
                productId: productObjectId,
                isPublished: true,
                isDeleted: false
            }
        },
        {
            $group: {
                _id: '$productId',
                totalQuantity: {
                    $sum: '$sku_stock'
                },
                minPrice: {
                    $min: '$sku_price'
                },
                maxPrice: {
                    $max: '$sku_price'
                }
            }
        }
    ])
    return result[0]
}

const getTotalInvenStock = async({
    productId
}) => {
    const productObjectId = convertToObjectIdMongodb(productId)
    const result = await SKU.aggregate([
        {
            $match: {
                productId: productObjectId,
                isPublished: true,
                isDeleted: false
            }
        },
        {
            $group: {
                _id: '$productId',
                totalQuantity: {
                    $sum: '$sku_stock'
                }
            }
        }
    ])
    return result[0]
}

const getMinAndMaxPrice = async({
    productId
}) => {
    const productObjectId = convertToObjectIdMongodb(productId)
    const result = await SKU.aggregate([
        {
            $match: {
                productId: productObjectId,
                isPublished: true,
                isDeleted: false
            }
        },
        {
            $group: {
                _id: "$productId",
                minPrice: {
                    $min: '$sku_price'
                },
                maxPrice: {
                    $max: '$sku_price'
                }
            }
        }
    ])
    return result[0]
}

const updateOneSku = async({
    productId,
    skuId,
    sku_tier_idx,
    sku_price,
    sku_stock
}) => {
    const result = await SKU.findOneAndUpdate(
        {
            productId,
            skuId
        },
        {
            $set: {
                sku_tier_idx,
                sku_price,
                sku_stock
            }
        },
        {
            new: true
        }
    )
    return result
}

const checkSkuByServer = async({
    productId,
    listSku
}) => {
    const checkSpus = await Promise.all(
        listSku.map( async sku => {
            const foundSku = await getOneSku({
                spuId: productId,
                skuId: sku.skuId
            })
            if(foundSku){
                return foundSku
            }
        })
    )
    return checkSpus
}

const updateListSku = async ({ 
    productId, 
    listSku 
}) => {
    const updatedSkus = await Promise.all(
        listSku.map(async sku => {
            return await SKU.findOneAndUpdate(
                {
                    productId: convertToObjectIdMongodb(productId),
                    skuId: sku.skuId
                },
                {
                    $set: {
                        sku_tier_idx: sku.sku_tier_idx,
                        sku_price: sku.sku_price,
                        sku_stock: sku.sku_stock
                    }
                },
                { new: true } 
            )
        })
    )
    return updatedSkus
}

const updateListSkuV2 = async({
    productId,
    listSku
}) => {
    const bulkOps = listSku.map( sku => ({
        updateOne: {
            filter: {
                productId: convertToObjectIdMongodb(productId),
                skuId: sku.skuId
            },
            update: {
                $set: {
                    sku_tier_idx: sku.sku_tier_idx,
                    sku_price: sku.price,
                    sku_stock: sku.stock
                }
            }
        }
    }))
    const result = await SKU.bulkWrite(bulkOps)
    return result
}


const publishSku = async(sku) => {
    const { modifiedCount } = await SKU.updateOne(
        {
            skuId: sku.skuId
        },
        {
            $set: {
                isDraft: sku.isDraft,
                isPublished: sku.isPublished
            }
        }
    )
    return modifiedCount
}

const unPublishSku = async(sku) => {
    const { modifiedCount } = await SKU.updateOne(
        {
            skuId: sku.skuId
        },
        {
            $set: {
                isDraft: sku.isDraft,
                isPublished: sku.isPublished
            }
        }
    )
    return modifiedCount
}

//update variations when delete variations in spu
const updateSkuAfterAddingProductVariation = async({
    productId
}) => {
    const productObjectId = convertToObjectIdMongodb(productId)
    const {modifiedCount} = await SKU.updateMany(
        {
            productId: productObjectId
        }, 
        {
            $push: {
                'sku_tier_idx': -1
            }
        }
    )
    return modifiedCount
}

const updateSkuAfterRemovingProductVariation = async({ productId, idx }) => {
    const productObjectId = convertToObjectIdMongodb(productId);

    // Bước 1: unset phần tử tại vị trí idx (giá trị sẽ trở thành null)
    await SKU.updateMany(
        { 
            productId: productObjectId 
        },
        { 
            $unset: { 
                [`sku_tier_idx.${idx}`]: 1 
            } 
        }
    );

    // Bước 2: pull các phần tử có giá trị null ra khỏi mảng
    const { modifiedCount } = await SKU.updateMany(
        { 
            productId: productObjectId 
        },
        { 
            $pull: { 
                sku_tier_idx: null 
            } 
        }
    );

    return modifiedCount;
};

const deleteOneSku = async({
    spuId,
    skuId
}) => {
    const spuObjectId = convertToObjectIdMongodb(spuId)
    const delSku = await SKU.deleteOne({
        skuId,
        productId: spuObjectId
    })
    return delSku
}

const deleteListSku = async({
    spuId
}) => {
    const spuObjectId = convertToObjectIdMongodb(spuId)
    const delSkus = await SKU.deleteMany({
        productId: spuObjectId
    })
    return delSkus
}

const setDefaultSku = async({
    spuId,
    skuId
}) => {
    const spuObjectId = convertToObjectIdMongodb(spuId)
    const sku = await SKU.updateMany(
        {
            productId: spuObjectId
        },
        [
            {
                $set: {
                    sku_default: {
                        $cond: [
                            {
                                $eq: [
                                    '$skuId', skuId
                                ]
                            },
                            true, 
                            false
                        ]
                    }
                }
            }
        ]
    )
    return sku
}

const unsetDefaultSku = async({
    spuId
}) => {
    const spuObjectId = convertToObjectIdMongodb(spuId)
    const sku = await SKU.updateMany(
        {
            productId: spuObjectId
        },
        {
            $set: {
                sku_default: false
            }
        }
    )
    return sku
}

const updateSkuTierIdx = async({
    productId,
    index,
    listValue = []
}) => {
    
    const productObjectId = convertToObjectIdMongodb(productId)
    const updatedSkus = await Promise.all(
        listValue.map( async value => {
            return await SKU.findOneAndUpdate(
                {
                    productId: productObjectId,
                    [`sku_tier_idx.${index}`]: value
                },
                {
                    $set: {
                        [`sku_tier_idx.${index}`]: -1
                    }
                },
                {
                    new: true
                }
            )
        })
    )
    return updatedSkus
}

const getOneSkuById = async(skuId) => {
    return await SKU.findOne({
            skuId
    })
    .populate('productId', 'product_shop -_id')
    .lean()
}

module.exports = {
    createSku,
    createOneSku,
    getAllSkuBySpuId,
    getOneSku,
    getOneSkuById,
    getTotalInvenStock,
    getMinAndMaxPrice,
    getTotalInvenStockAndPriceSku,
    updateOneSku,
    updateListSku,
    updateListSkuV2,
    checkSkuByServer,
    publishSku,
    unPublishSku,
    updateSkuAfterAddingProductVariation,
    updateSkuAfterRemovingProductVariation,
    deleteListSku,
    deleteOneSku,
    setDefaultSku,
    unsetDefaultSku,
    updateSkuTierIdx
}