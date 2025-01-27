'use strict'

const { NotFoundError, BadRequestError } = require('../core/error.response')
const { findShopById } = require("../models/repositories/shop.repo")
const { createSku } = require('../models/repositories/sku.repo')
const { createSpu } = require('../models/repositories/spu.repo')
const { findUserById } = require('../models/repositories/user.repo')
const { convertToObjectIdMongodb } = require("../utils")

const createSpuService = async({
    userId,
    name,
    thumb,
    description,
    price,
    category,
    quantity,
    variations,
    sku_list = []
}) => {
    const foundUser = await findUserById(userId)
    if(!foundUser) throw new NotFoundError('User not found')

    //check shop role (vi du viet middleware sau)
    if(foundShop.usr_role !== 'shop') throw new BadRequestError('You dont have permisssion')

    const foundShop = await findShopById({ shopId: convertToObjectIdMongodb(foundUser._id)})
    if(!foundShop) throw new NotFoundError('Shop not found')
        
    const spu = await createSpu({
        shop, 
        name, 
        thumb,
        description,
        price,
        category,
        quantity,
        variations
    })
    if(!spu) throw new BadRequestError('Create spu failed')
    if(spu && sku_list.length > 0) {
        //create sku
        const sku = await createSku({
            spuId: spu._id,
            sku_list,
            shopId: shop
        })

        if(!sku) throw new BadRequestError('Create sku failed')
    }
    return spu
}

module.exports = {
    createSpuService
}