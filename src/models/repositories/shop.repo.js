'use strict'

const { getSelectData } = require('../../utils')
const SHOP = require('../shop.model')

const createShop = async ({
    userId,
    shop_name,
    shop_email,
    shop_address,
    shop_phone,
}) => {
    const newShop = await SHOP.create({
        userId: userId,
        shop_name: shop_name,
        shop_email: shop_email,
        shop_address: shop_address,
        shop_phone: shop_phone
    })
    return newShop
}

const disableShop = async({
    shopId
}) => {
    const filter = { _id: shopId},
            update = { shop_status: 'inactive'},
            options = { new: true}
    const shop = await SHOP.updateOne(filter, update, options)
    return shop
}

const verifyShop = async({
    shopId
}) => {
    const filter = { _id: shopId},
            update = { shop_verify: true},
            options = { new: true}
    const shop = await SHOP.updateOne(filter, update, options)
    return shop
}

const findShopByUserId = async({
    userId
}) => {
    const foundShop = await SHOP.findOne({ userId})
    return foundShop
}

const findShopById = async({
    shopId
}) => {
    const foundShop = await SHOP.findOne({ _id: shopId})
    return foundShop
}

const findShopByEmail = async({
    email
}) => {
    const foundShop = await SHOP.findOne({ shop_email: email})
    return foundShop
}

const findALlShop = async({
    limit = 50, page = 1, sort = 'ctime', 
    filter, select
}) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    const shops = await SHOP.find(filter)
                        .sort(sortBy)
                        .skip(skip)
                        .limit(limit)
                        .select(getSelectData(select))
    return shops
}

module.exports = {
    createShop,
    findShopByUserId,
    findShopById,
    disableShop,
    verifyShop,
    findShopByEmail,
    findALlShop
}