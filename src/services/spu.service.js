'use strict'

const { NotFoundError, BadRequestError } = require('../core/error.response')
const { findShopById, findShopByUserId } = require("../models/repositories/shop.repo")
const { createSku, getAllSkuBySpuId, getOneSku } = require('../models/repositories/sku.repo')
const { createSpu, getOneSpuBySlug, getAllSpu, getOneSpuById, publishProductByShop, unPublishProductByShop, queryProduct } = require('../models/repositories/spu.repo')
const { findUserById } = require('../models/repositories/user.repo')
const { convertToObjectIdMongodb } = require("../utils")

//create product without variations
const createSpuWithoutVariationsService = async({
    userId,
    name,
    thumb,
    description,
    price,
    category,
    quantity
}) => {

}
//khi đã tạo sản phẩm không có biến thể rồi mà muốn thêm biến thể thì sao? Có được không? Và làm thế nào?



//create product with variations
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

    const foundShop = await findShopById({ userId: convertToObjectIdMongodb(foundUser._id)})
    if(!foundShop) throw new NotFoundError('Shop not found')
    if(foundUser.usr_role !== 'shop') throw new BadRequestError('You dont have permisssion')
    const shop = foundShop._id
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
        try {
            //create sku
            const sku = await createSku({
                spuId: spu._id,
                sku_list,
                shopId: shop
            })
            //TODO
            //lặp sku sau đó tính tại stock và min price max price
        } catch (error) {
            if(!sku) throw new BadRequestError('Create sku failed')
        }
    }
    return spu
}

const getOneSpuService = async({
    slug
}) => {
    const foundSpu = await getOneSpuBySlug(slug)
    if(!foundSpu) throw new NotFoundError('Spu not found')
    if(foundSpu.isDeleted) throw new BadRequestError('This product has been deleted') 
    const productId = foundSpu._id
    const listSku = await getAllSkuBySpuId({ spuId: productId})
    
    if(!listSku) throw new NotFoundError('Sku not found')

    return {
        spu: foundSpu,
        sku: listSku
    }
}

//this service for shop
const getListSkuBySpuIdService = async({
    spuId
}) => {
    const sku = await getAllSkuBySpuId({
        spuId: convertToObjectIdMongodb(spuId),
        unSelect: ['isDeleted', 'createdAt', 'updatedAt', '__v']
    })
    if(!sku) throw new NotFoundError('Sku not found')
    return sku
}

const getOneSkuService = async({
    spuId,
    skuId
}) => {
    const sku = await getOneSku({
        spuId,
        skuId,
        unSelect: ['isDeleted', 'createdAt', 'updatedAt', '__v']
    })
    console.log(sku);
    
    if(!sku) throw new NotFoundError('Sku not found')
    return sku
}

const deleteSpuService = async() => {

}

const getAllSpuService = async({
    limit = 30,
    page = 1,
    search = ''
}) => {
    const spus = await getAllSpu({
        limit,
        page,
        search,
        unSelect: ['__v', 'isDeleted', 'createdAt', 'updatedAt']
    })
    if(!spus) throw new NotFoundError('Spus not found')
    return spus
}

const updateInventoryStockSpuService = async({
    shop,
    spuId,
    stock
}) => {

}

const updateInventoryStockSkuService = async({
    shop,
    spuId,
    skuId,
    stock
}) => {

}

const updateVariationsSpuService = async() => {

}


const publishProductByShopService = async({
    userId,
    spuId
}) => {
    const foundShop = await findShopByUserId({ userId })
    if(!foundShop) throw new NotFoundError('Shop not found')
    
    const shopId = foundShop._id
    const foundProduct = await getOneSpuById({
        shop: shopId,
        spuId
    })
    if(!foundProduct) throw new NotFoundError('Product not found')
    if(foundProduct.isPublished) throw new BadRequestError('Product has been publish')
    foundProduct.isDraft = false
    foundProduct.isPublished = true

    const modifiedCount = await publishProductByShop({ product: foundProduct })
    if(modifiedCount <= 0) throw new BadRequestError('Publish product failure')

    return modifiedCount
}

const unPublishProductByShopService = async({
    userId,
    spuId
}) => {
    const foundShop = await findShopByUserId({ userId })
    if(!foundShop) throw new NotFoundError('Shop not found')
    
    const shopId = foundShop._id
    const foundProduct = await getOneSpuById({
        shop: shopId,
        spuId
    })
    if(!foundProduct) throw new NotFoundError('Product not found')
    if(foundProduct.isDraft) throw new BadRequestError('Product has been unpublish')
    foundProduct.isDraft = true
    foundProduct.isPublished = false

    const modifiedCount = await unPublishProductByShop({ product: foundProduct })
    if(modifiedCount <= 0) throw new BadRequestError('unPublish product failure')

    return modifiedCount
}

const getAllDraftsForShopService = async({
    product_shop,
    limit = 30,
    page = 1,
    search = '',
}) => {
    const query = { 
        product_shop,
        isDraft: true,
        isDeleted: false
    }
    if(search){
        query.product_name = { $regex: search, $options: 'i'}
    }

    const spus = await queryProduct({
        query,
        limit,
        page
    })
    if(!spus.data.length > 0) return "List product not found"
    
    return spus
}

const getAllPublicForShopService = async({
    product_shop,
    limit = 30,
    page = 1,
    search = '',
}) => {
    const query = { 
        product_shop,
        isPublished: true,
        isDeleted: false
    }
    if(search){
        query.product_name = { $regex: search, $options: 'i'}
    }
    const spus = await queryProduct({
        query,
        limit,
        page
    })
    if(!spus.data.length > 0) return "List product not found"

    return spus
}

const getAllProductForShopService = async({
    product_shop,
    limit = 30,
    page = 1,
    search = ''
}) => {
    const query = {
        product_shop,
        isDeleted: false
    }
    if(search) query.product_name = { $regex: search, $options: 'i'}

    const spus = await queryProduct({
        query,
        limit,
        page
    })
    if(!spus.data.length > 0) return "List product not found"
    return spus
}

const updateSpuService = async() => {

}

const updateSkuservice = async() => {

}

//display for customer
const getAllSpuForClient = async() => {

}

module.exports = {
    createSpuService,
    getOneSpuService,
    getListSkuBySpuIdService,
    getOneSkuService,
    getAllSpuService,
    publishProductByShopService,
    unPublishProductByShopService,
    getAllDraftsForShopService,
    getAllPublicForShopService,
    getAllProductForShopService
}