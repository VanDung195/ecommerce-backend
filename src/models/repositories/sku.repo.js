'use strict'

const SKU = require('../sku.model')
const { convertToObjectIdMongodb, unSelectData } = require('../../utils/index')

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

const createOneSku = async({
    shopId,
    spuId,
    skuId,
    sku_tier_idx,
    sku_price,
    sku_stock
}) => {

}

const deleteSku = async({
    shopId,
    spuId,
    skuId
}) => {

}

const deleteListSku = async({
    shopId,
    spuId
}) => {
    
}

const getTotalInvenStockAndPrice = async({
    productId
}) => {
    const productObjectId = convertToObjectIdMongodb(productId)
    const result = await SKU.aggregate([
        {
            $match: {
                productId: productObjectId,
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


const publishSku = async() => {

}

const unPublishSku = async() => {

}


module.exports = {
    createSku,
    getAllSkuBySpuId,
    getOneSku,
    getTotalInvenStock,
    getMinAndMaxPrice,
    getTotalInvenStockAndPrice,
    updateOneSku,
    updateListSku,
    updateListSkuV2,
    checkSkuByServer
}