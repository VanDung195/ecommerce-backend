'use strict'

const { CACHE_PRODUCT } = require("../configs/constant")
const { getCache } = require("../models/repositories/cache.repo")

const readProductCache = async(req, res, next) => {
    const { slug } = req.params
    const productDetailCache = `${CACHE_PRODUCT.PRODUCT_DETAIL}${slug}`
    const productDetail = getCache({ key: productDetailCache })
    if(productDetail){
        return res.status(200).json({
            ...JSON.parse(productDetail),
            toLoad: 'cache middleware'
        })
    }
}

module.exports = {
    readProductCache
}