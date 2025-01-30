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

const getOneSpuById = async(spuId) => {
    const spu = await SPU.findOne({
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
    page
}) => {

}

module.exports = {
    createSpu,
    getOneSpuById,
    getOneSpuBySlug,
    getAllSpu
}