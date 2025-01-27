'use strict'

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

const getOneSpu = async() => {

}

const getAllSpu = async({
    limit,
    page
}) => {

}

module.exports = {
    createSpu,
    getOneSpu,
    getAllSpu
}