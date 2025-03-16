'use strict'

const INVENTORY = require('../inventory.model')
const { convertToObjectIdMongodb } = require('../../utils/index')

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

const reservationInventory = async({ productId, quantity, cartId, orderId}) => {
    const query = {
        inven_productId: productId,
        inven_stock: {
            $gte: quantity
        }
    }, update = {
        $inc: {
            inven_stock: -quantity
        },
        $push: {
            inven_reservations: {
                orderId,
                quantity,
                cartId,
                createdOn: new Date()
            }
        }
    }, options = { upsert: false }
    return await INVENTORY.updateOne(query, update, options)
}

/*
    [
        {
            orderId,
            productId,
            quantity
        }
    ]
*/
const releaseReservedInventory = async({ products }) => {
    return await Promise.all(
        products.map( async product => {
            const query = {
                inven_productId: product.productId,
                'inven_reservations.orderId': product.orderId
            }, update = {
                $inc: {
                    inven_stock: product.quantity
                },
                $pull: {
                    inven_reservations: { orderId: product.orderId}
                }
            }, option = { new: true}
            const updateInven = await INVENTORY.findOneAndUpdate(query, update, option)

            return updateInven
        })
    )
}

const getReservationByOrderId = async({ orderId }) => {
    const reservation = INVENTORY.aggregate([
        {
            $match: {
                'inven_reservations.orderId': convertToObjectIdMongodb(orderId)
            }
        },
        {
            $project: {
                _id: 0,
                orderId: '$inven_reservations.orderId',
                productId: '$inven_productId',
                quantity: '$inven_reservations.quantity'
            }
        },
        {
            $unwind: '$orderId'
        },
        {
            $unwind: '$quantity'
        }
    ])
    return reservation
}

module.exports = {
    addStockToInventory,
    updateInventorySold,
    checkInventoryStock,
    getInventory,
    reservationInventory,
    releaseReservedInventory ,
    getReservationByOrderId
}
