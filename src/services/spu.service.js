'use strict'

const { CACHE_PRODUCT } = require('../configs/constant')
const { NotFoundError, BadRequestError } = require('../core/error.response')
const { setCacheExpiration } = require('../models/repositories/cache.repo')
const { addStockToInventory } = require('../models/repositories/inventory.repo')
const { findShopById, findShopByUserId } = require("../models/repositories/shop.repo")
const { createSku, getAllSkuBySpuId, getOneSku, updateSkuAfterAddingProductVariation, updateSkuAfterRemovingProductVariation, createOneSku, updateSkuTierIdx } = require('../models/repositories/sku.repo')
const { createSpu, getOneSpuBySlug, getAllSpu, getOneSpuById, publishProductByShop, unPublishProductByShop, queryProduct, addVariation, deleteVariation, updateVariationOptions, updateInvenStockAndPrice } = require('../models/repositories/spu.repo')
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
            const skus = await createSku({
                spuId: spu._id,
                sku_list,
                shopId: shop
            })

            await Promise.all( skus.map( async sku => {
                return await addStockToInventory({
                    productId: sku.skuId,
                    shopId: shop,
                    stock: sku.sku_stock
                })
            }))

        } catch (error) {
            if(!sku) throw new BadRequestError('Create sku failed')
        }
    }
    if(spu && variations === null || variations.length === 0){
        try {
            const sku = await createOneSku({
                shopId: shop,
                spuId: spu._id,
                sku_price: price,
                sku_stock: quantity
            })
            await addStockToInventory({
                productId: sku.skuId,
                shopId: shop,
                stock: sku.sku_stock
            })
        } catch (error) {
            throw new BadRequestError('Create sku failed')
        }
    }
    await updateInvenStockAndPrice({ productId: spu._id})
    return spu
}

const getOneSpuService = async({
    slug
}) => {
    const foundSpu = await getOneSpuBySlug(slug)
    if(!foundSpu) throw new NotFoundError('Spu not found')
    if(foundSpu.isDeleted) throw new BadRequestError('This product has been deleted') 
    const productId = foundSpu._id
    let listSku = await getAllSkuBySpuId({ spuId: productId})
    listSku = listSku.filter(sku => !sku.isDeleted); 
    if(!listSku) throw new NotFoundError('Sku not found')

    const productDetail = {
        spu: foundSpu,
        sku: listSku
    }
    const productDetailCache = `${CACHE_PRODUCT.PRODUCT_DETAIL}${slug}`
    setCacheExpiration({
        key: productDetailCache,
        value: JSON.stringify(productDetail),
        expiration: 20
    }).then()
    return productDetail
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
    await updateInvenStockAndPrice({ productId: foundProduct._id})

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
    await updateInvenStockAndPrice({ productId: foundProduct._id})
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

const deleteProductVariationService = async({
    shopId,
    spuId,
    variation_idx,
    variation_name
}) => {
    try {
        const foundProduct = await getOneSpuById({ 
            shop: shopId,
            spuId
        })
        if(!foundProduct) throw new NotFoundError('Product not found')
        if(foundProduct.product_variations[variation_idx].name.toLowerCase() !== variation_name.toLowerCase())
            throw new BadRequestError('Invalid request')

        const delVariation = await deleteVariation({
            shopId,
            spuId,
            variation_name,
        })
        if(!delVariation) 
            throw new BadRequestError('Delete product variation failure')
    
        const deletedVariationIndex = foundProduct.product_variations.findIndex( variation => variation.name === variation_name) 
        const updateSku = await updateSkuAfterRemovingProductVariation({ 
            productId: spuId,
            idx: deletedVariationIndex,
        })
        if(!updateSku)
            throw new BadRequestError('Update sku failure')
        return delVariation
    } catch (error) {
        console.error(error)
    }
}

const addProductVariationService = async({
    shopId,
    spuId,
    images = [], 
    name,
    options
}) => {
    try {
        const foundProduct = await getOneSpuById({
            shop: shopId,
            spuId
        })
        if(!foundProduct) 
            throw new NotFoundError('Product not found')
        
        const newSpuVariation = await addVariation({
            shopId,
            spuId,
            images,
            name,
            options,
        })
        
        if(!newSpuVariation) 
            throw new BadRequestError('Add variation failure')
        
        const updateSku = await updateSkuAfterAddingProductVariation({ 
            productId: spuId,
        }); 
        
        if(!updateSku)
            throw new BadRequestError('Update sku failure');
        
        return newSpuVariation;
    } catch (error) {
        throw error;
    } 
}
//trả về vị trí đã bị thay đổi
const getChangedIndices = async({
    oldIndicies,
    newIndicies,
}) => {
    let indices = oldIndicies.reduce((acc, item, index) => {
        if (!newIndicies.includes(item)) {
            acc.push(index);
        }
        return acc;
    }, []);
    return indices
}

const testNhe = async({
    shopId,
    spuId
}) => {
    const foundProduct = await getOneSpuById({ shop: shopId, spuId})
    let index = foundProduct.product_variations.findIndex( variation => variation.name === 'size')
    //cái này là mảng cũ => so sánh với mảng mới => Lấy vị trí đã bị thay đổi => 
    //update tại vị trí đã bị thay đổi ở sku_tier_idx ở sku thành -1 nhé!!!
    for(let i = 0; i < foundProduct.product_variations.length; i++){
        const variation = foundProduct.product_variations[i]
        if(variation.name.toLowerCase() === 'color'){
            return variation.options
        }
    }
    return foundProduct
}

const getChangedIndicesV2 = async({
    oldIndicies,
    newIndicies
}) => {
    const mapping = {}
    oldIndicies.forEach(( item, index ) => {
        const newIndex = newIndicies.indexOf(item)
        mapping[index] = newIndex >= 0 ? newIndex : -1
    })
    return mapping
}

const updateVariationOptionsService = async({
    shopId,
    spuId,
    variation_name,
    variation_options
}) => {
    const foundProduct = await getOneSpuById({ shop: shopId, spuId})
    if(!foundProduct) 
        throw new NotFoundError('Product not found')
    if(!foundProduct.product_shop.equals(shopId))
        throw new BadRequestError('Invalid request')

    let variationIndex
    let oldOptions
    foundProduct.product_variations.forEach(( variation, index) => {
        if(variation.name.toLowerCase() === variation_name.toLowerCase()){
            variationIndex = index
            oldOptions = variation.options
        }
    })
    if(variationIndex === undefined)
        throw new NotFoundError('Variation not found')
    const updatedVariationOptions = await updateVariationOptions({ 
        shopId, 
        spuId,
        variationIdx: variationIndex,
        variationName: variation_name,
        variationOptions: variation_options
    })
    if(!updatedVariationOptions)
        throw new BadRequestError('Update variation options failure')
    const mapping = await getChangedIndicesV2({
        oldIndicies: oldOptions,
        newIndicies: variation_options
    })
    const updatedSkuTierIdx = await updateSkuTierIdx({ 
        productId: spuId,
        variationIndex,
        mapping
    })
    return updatedSkuTierIdx
}

const updateSpuService = async({
    shopId,
    productId,
    name,
    thumb,
    description
}) => {

}
//display for customer
const getAllSpuForClient = async() => {

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
    getAllProductForShopService,
    deleteProductVariationService,
    addProductVariationService,
    updateVariationOptionsService,
    testNhe
}