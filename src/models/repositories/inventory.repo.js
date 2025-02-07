'use strict'

const INVENTORY = require('../inventory.model')

//Synchronize inventory when updating product or creating product
const addStockToInventory = async({
    productId,
    shopId,
    stock
}) => {
    let inven_status = 'instock'
    if(+stock === 0)
        inven_status = 'out_of_stock'
    if(+stock <= 10 && +stock != 0)
        inven_status = 'low_stock'
    const filter = {
        inven_productId: productId,
        inven_shopId: shopId
    },
    updateSet = {
        $set: {
            inven_stock: stock,
            inven_status
        }
    },
    options = {
        upsert: true, new: true
    }
    return await INVENTORY.findOneAndUpdate(filter, updateSet, options)
}

const updateInventorySold = async({
    productId,
    shopId,
    quantity
}) => {
    const filter = {
        inven_productId: productId,
        inven_shopId: shopId
    },
    update = {
        $inc: {
            inven_sold: quantity
        }
    },
    options = { new: true }
    return await INVENTORY.findOneAndDelete(filter, update, options)
}

const checkInventoryStock = async({
    productId,
    shopId,
    quantity
}) => {
    const inven = await INVENTORY.findOne({
        inven_productId: productId,
        inven_shopId: shopId
    })
    if(inven.inven_stock <= quantity) 
        return false
    return true
}

const getInventory = async({
    productId,
    shopId,
}) => {
    return await INVENTORY.findOne({
        inven_productId: productId,
        inven_shopId: shopId
    })
}

module.exports = {
    addStockToInventory,
    updateInventorySold,
    checkInventoryStock,
    getInventory
}
