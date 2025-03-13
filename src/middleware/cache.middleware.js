'use strict'

const { CACHE_PRODUCT } = require("../configs/constant")
const { SuccessResponse } = require("../core/success.response")
const { getCache } = require("../models/repositories/cache.repo")

const readProductCache = async(req, res, next) => {
    const { slug } = req.params
    const productDetailCache = `${CACHE_PRODUCT.PRODUCT_DETAIL}${slug}`
    const productDetail = await getCache({ key: productDetailCache })
    if(!productDetail) 
        return next()
    if(productDetail){
        return new SuccessResponse({
            message: 'Success Cache',
            metadata: JSON.parse(productDetail)
        }).send(res)
    }
}

module.exports = {
    readProductCache
}