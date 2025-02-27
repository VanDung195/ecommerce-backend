'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const ORDER = require('../order.model')

const createOrder = async({
    userId,
    order_checkout,
    shipping,
    payment,
    order_products = [],
    order_note
}) => {
    const order = await ORDER.create({
        order_userId: userId,
        order_checkout,
        order_shipping: shipping,
        order_payment: payment,
        order_products,
        order_note
    })
    return order
}

const getOrderByUser = async({ userId, orderId }) => {
    return await ORDER.findOne({
        order_userId: userId,
        _id: convertToObjectIdMongodb(orderId)
    })
} 

module.exports = {
    createOrder,
    getOrderByUser
}