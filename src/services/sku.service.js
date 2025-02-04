'use strict'

const { NotFoundError, BadRequestError } = require("../core/error.response")
const { getOneSku, updateOneSku, getTotalInvenStockAndPriceSku, checkSkuByServer, updateListSku, publishSku, unPublishSku } = require("../models/repositories/sku.repo")
const { updateInvenStockAndPrice, getOneSpuById } = require("../models/repositories/spu.repo")

const updateOneSkuService = async({
    shopId,
    productId,
    skuId,
    sku_tier_idx,
    sku_default,
    sku_price,
    sku_stock
}) => {
    const foundSku = await getOneSku({
        spuId: productId,
        skuId
    })
    if(!foundSku) throw new NotFoundError('SKU not found')
    if(!shopId.equals(foundSku.productId.product_shop)) throw new BadRequestError('Invalid request')

    const foundSpu = await getOneSpuById({
        shop: foundSku.productId.product_shop,
        spuId: productId

    })
    if(!foundSpu) throw new NotFoundError('Product not found')
    
    const sku = await updateOneSku({
        productId,
        skuId,
        sku_tier_idx,
        sku_default,
        sku_price,
        sku_stock
    })
    if(!sku) throw new BadRequestError('Update sku failure')
    
    // const result = await getTotalInvenStockAndPriceSku({ productId })
    
    // const updateSpu = await updateInvenStockAndPrice({
    //     productId,
    //     totalInvenStock: result.totalQuantity,
    //     minPrice: result.minPrice,
    //     maxPrice: result.maxPrice
    // })

    const updateSpu = await updateInvenStockAndPrice({
        productId
    })
    if(!updateSpu) throw new BadRequestError('Update inventory stock and price failure')
    
    return sku
}

const updateListSkuService = async({
    shopId,
    productId,
    listSku
}) => {
    const foundSpu = await getOneSpuById({ shop: shopId, spuId: productId})
    if(!foundSpu) throw new BadRequestError('Request is valid')
    
    const checkSku = await checkSkuByServer({ productId, listSku})
    if(!checkSku) throw new BadRequestError('Something went wrong!')

    const updateSku = await updateListSku({ 
        productId,
        listSku
    })
    if(!updateSku) throw new BadRequestError('Update sku failure')

    const updateSpu = await updateInvenStockAndPrice({
        productId
    })

    return updateSku
}

const publishSkuService = async({
    shopId,
    productId,
    skuId
}) => {
    const foundSku = await getOneSku({
        spuId: productId,
        skuId
    })
    if(!foundSku) throw new NotFoundError('Sku not found')
    if(!shopId.equals(foundSku.productId.product_shop)) throw new BadRequestError('Invalid request')
    foundSku.isDraft = false
    foundSku.isPublished = true

    const update = await publishSku(foundSku)

    const updateSpu = await updateInvenStockAndPrice({
        productId
    })

    return update > 0 ? "Publish sku successfuly" : "Publish sku failure"
}

const unPublishSkuService = async({
    shopId,
    productId,
    skuId
}) => {
    const foundSku = await getOneSku({
        spuId: productId,
        skuId
    })
    if(!foundSku) throw new NotFoundError('Sku not found')
    if(!shopId.equals(foundSku.productId.product_shop)) throw new BadRequestError('Invalid request')
    foundSku.isDraft = true
    foundSku.isPublished = false

    const update = await unPublishSku(foundSku)

    const updateSpu = await updateInvenStockAndPrice({
        productId
    })

    return update > 0 ? "Un publish sku successfuly" : "Un publish failure"
}

module.exports = {
    updateOneSkuService,
    updateListSkuService,
    publishSkuService,
    unPublishSkuService
}