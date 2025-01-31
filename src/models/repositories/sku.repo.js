'use strict'

const SKU = require('../sku.model')
const { convertToObjectIdMongodb } = require('../../utils/index')

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

const getSkuBySpuId = async({
    spuId,
    unSelect = []
}) => {
    const sku = await SKU.find({
        productId: spuId
    }).select(unSelect).lean()
    
    return sku
}

module.exports = {
    createSku,
    getSkuBySpuId
}