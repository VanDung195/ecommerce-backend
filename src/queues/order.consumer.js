'use strict'

const { BadRequestError } = require('../core/error.response')
const { connectToRabbitMQ } = require('../dbs/init.rabbit')
const { updateCartCount, removeFromCart, removeCartShop } = require('../models/repositories/cart.repo')
const { updateDiscountForOrder, getOneDiscountCode, findOneDiscountWithoutLean } = require('../models/repositories/discount.repo')
const { unReservationInventory } = require('../models/repositories/inventory.repo')
const { cancelOrder } = require('../models/repositories/order.repo')
const { updateSkusStock, getOneSkuById } = require('../models/repositories/sku.repo')
const { updateInventoryStockSpuByProductId, increaseInventoryStockSpuBySpuId } = require('../models/repositories/spu.repo')
const { getUniqueData } = require('../utils')

//update cart and sync inventories, update discount
const consumerOrderNormal = async () => {
    try {
        const { connection, channel } = await connectToRabbitMQ()
        const orderQueue = 'orderQueueProcess'
        console.log(`Order Consumer is listening on queue "${orderQueue}"...`);
        channel.consume(orderQueue, async msg => {
            try {
                const payload = JSON.parse(msg.content.toString())
                const orderProducts = payload.orderProducts
                const userId = payload.userId
                const spuIds = []
                let countProducts = 0
                if(orderProducts.shop_discount){
                    const updatedDiscount = await updateDiscountForOrder({
                        userId, 
                        shopId: orderProducts.shopId, 
                        discountId: orderProducts.shop_discount.discountId, 
                        code: orderProducts.shop_discount.code
                    })
                    if(!updatedDiscount)
                        throw new BadRequestError('Update discount failed! Pls hotfix')
                }
                /*
                    [
                        {
                            productId,
                            quantity
                        }
                    ]
                    */
                const shopId = orderProducts.shopId
                const skus = []
                let delProductFromCart
                for (const product of orderProducts.item_products) {
                    const sku = await getOneSkuById(product.productId);
                    spuIds.push(sku.productId._id.toString());
                    skus.push({
                        productId: product.productId,
                        quantity: product.quantity
                    });
                    delProductFromCart = await removeFromCart({ userId, productId: product.productId, shopId})
                    countProducts++
                }
                //delete shop in cart
                const shopIndex = delProductFromCart.cart_products.findIndex( shop => shop.shopId.toString() === shopId)
                if(shopIndex !== -1){
                    const shopProducts = delProductFromCart.cart_products[shopIndex].product_shop
                    if(shopProducts.length === 0){
                        await removeCartShop({ userId, shopId })
                    }
                }
                const updatedStock = await updateSkusStock({ skus, isIncrease: false})
                if(!updatedStock)
                    throw new BadRequestError('Update stock failed! Pls hotfix')
                //updat cart count
                await updateCartCount({
                    userId,
                    quantity: -countProducts
                })
                const uniqueArraySpuIds = getUniqueData(spuIds)
                for(const spuId of uniqueArraySpuIds){
                    const updatedSpu = await updateInventoryStockSpuByProductId({ productId: spuId })
                    if(!updatedSpu)
                        throw new BadRequestError('Update spu stock failed! Pls hot fix')
                }
                console.log('DA ACKNOWLEDMENT ROI NHE')
                channel.ack(msg)
            } catch (error) {
                console.error(error)
                channel.ack(msg, false, false)
            }
        })
    } catch (error) {
        console.error(error)
        throw error
    }
}

const consumerOrderCancellation = async() => {
    try {
        const { connection, channel } = await connectToRabbitMQ()
        const cancelOrderQueue = 'cancelOrderQueueProcess'
        console.log(`Cancel order consumer is listening on queue ${cancelOrderQueue}........`)
        channel.consume(cancelOrderQueue, async msg => {
            try {
                const order = JSON.parse(msg.content.toString())
                //restore discount
                const orderId = order._id
                const products = order.order_products.item_products
                const formattedProducts = []
                await Promise.all(
                    products.map( async product => {
                        const sku = await getOneSkuById(product.productId)
                        const spuId = sku.productId._id //populate('productId', 'product_shop product_name _id')
                        console.log(sku) 
                        formattedProducts.push({
                            orderId,
                            productId: product.productId, //skuId
                            quantity: product.quantity
                        })
                        // await increaseInventoryStockSpuBySpuId({ productId: spuId, quantity: product.quantity })
                    })
                )
                console.log(order)
                const userId = order.order_userId
                if(order.order_products.shop_discount !== null){
                    //restore discount
                    const discount = order.order_products.shop_discount
                    console.log(discount)
                    const foundDiscount = await findOneDiscountWithoutLean({ shopId: discount.shopId, discountId: discount.discountId, code: discount.code})
                    if(!foundDiscount)
                        throw new BadRequestError('Discount not found')
                }
                //un reservation in inventories model
                // await unReservationInventory({ products: formattedProducts })
                //update skus stock
                // await updateSkusStock({ skus: formattedProducts, isIncrease: true })
                console.log('ACKNOWLEDMENT')
                channel.ack(msg)
            } catch (error) {
                console.error(error)
            }
        })
    } catch (error) {
        console.error(error)
    }
}

const consumerOrderNormalV2 = async () => {
    try {
        const { connection, channel } = await connectToRabbitMQ()
        const orderQueue = 'orderQueueProcess'
        console.log(`Order Consumer is listening on queue "${orderQueue}"...`);
        channel.consume(orderQueue, async msg => {
            try {
                const payload = JSON.parse(msg.content.toString())
                const orderProducts = payload.orderProducts
                const userId = payload.userId
                const spuIds = []
                let countProduct = 0
                for (const orderProduct of orderProducts) {
                    if(orderProduct.shop_discount){
                        const updatedDiscount = await updateDiscountForOrder({
                            userId, 
                            shopId: orderProduct.shopId, 
                            discountId: orderProduct.shop_discount.discountId, 
                            code: orderProduct.shop_discount.code
                        })
                        if(!updatedDiscount)
                            throw new BadRequestError('Update discount failed! Pls hotfix')
                    }
                    /*
                        [
                            {
                                productId,
                                quantity
                            }
                        ]
                     */
                    const shopId = orderProduct.shopId
                    const skus = []
                    let delProductFromCart
                    for (const product of orderProduct.item_products) {
                        const sku = await getOneSkuById(product.productId);
                        spuIds.push(sku.productId._id.toString());
                        skus.push({
                            productId: product.productId,
                            quantity: product.quantity
                        });
                        delProductFromCart = await removeFromCart({ userId, productId: product.productId, shopId})
                        countProduct++
                    }
                    //delete shop in cart
                    const shopIndex = delProductFromCart.cart_products.findIndex( shop => shop.shopId.toString() === shopId)
                    if(shopIndex !== -1){
                        const shopProducts = delProductFromCart.cart_products[shopIndex].product_shop
                        if(shopProducts.length === 0){
                            await removeCartShop({ userId, shopId })
                        }
                    }

                    const updatedStock = await updateSkusStock({ skus, isIncrease: false})
                    if(!updatedStock)
                        throw new BadRequestError('Update stock failed! Pls hotfix')
                }
                //updat cart count
                await updateCartCount({
                    userId,
                    quantity: -countProduct
                })
                const uniqueArraySpuIds = getUniqueData(spuIds)
                for(const spuId of uniqueArraySpuIds){
                    const updatedSpu = await updateInventoryStockSpuByProductId({ productId: spuId })
                    if(!updatedSpu)
                        throw new BadRequestError('Update spu stock failed! Pls hot fix')
                }
                console.log('DA ACKNOWLEDMENT ROI NHEEEEEEEE')
                channel.ack(msg)
            } catch (error) {
                console.error(error)
                channel.ack(msg, false, false)
            }
        })
    } catch (error) {
        console.error(error)
        throw error
    }
}



const consumerOrderFailed = async () => {
    try {
        const { connection, channel } = await connectToRabbitMQ()

        const orderExchangeDLX = 'orderExDLX'
        const orderRoutingKeyDLX = 'orderRoutingKeyDLX'
        const orderQueueHandler = 'orderQueueHotFix'

        await channel.assertExchange(orderExchangeDLX, 'direct', {
            durable: true
        })
        const queueResult = channel.assertQueue(orderQueueHandler, {
            exclusive: false
        })
        await channel.bindQueue(queueResult.queue, orderExchangeDLX, orderRoutingKeyDLX)

        await channel.consume(queueResult.queue, msgFailed => {
            console.log(`this order error, pls hotfix::${msgFailed}`)
        }, {
            noAck: true
        })

    } catch (error) {
        console.error(error)
        throw error
    }
}

module.exports = {
    consumerOrderNormal,
    consumerOrderFailed,
    consumerOrderCancellation
}