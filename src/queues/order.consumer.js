'use strict'

const { BadRequestError } = require('../core/error.response')
const { connectToRabbitMQ } = require('../dbs/init.rabbit')
const { updateDiscountForOrder } = require('../models/repositories/discount.repo')
const { updateSkusStock, getOneSkuById } = require('../models/repositories/sku.repo')
const { updateInventoryStockSpuByProductId } = require('../models/repositories/spu.repo')
const { getUniqueData } = require('../utils')

//update cart and sync inventories, update discount
const consumerOrderNormal = async () => {
    try {
        const { connection, channel } = await connectToRabbitMQ()
        const orderQueue = 'orderQueueProcess'
        console.log(`🔄 Order Consumer is listening on queue "${orderQueue}"...`);
        channel.consume(orderQueue, async msg => {
            try {
                const payload = JSON.parse(msg.content.toString())
                const orderProducts = payload.orderProducts
                const userId = payload.userId
                const spuIds = []

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
                    const skus = []
                    for (const product of orderProduct.item_products) {
                        const sku = await getOneSkuById(product.productId);
                        spuIds.push(sku.productId._id.toString());
                        skus.push({
                            productId: product.productId,
                            quantity: product.quantity
                        });
                    }
                    const updatedStock = await updateSkusStock({ skus, isIncrease: false})
                    if(!updatedStock)
                        throw new BadRequestError('Update stock failed! Pls hotfix')
                }
                const uniqueArraySpuIds = getUniqueData(spuIds)
                for(const spuId of uniqueArraySpuIds){
                    const updatedSpu = await updateInventoryStockSpuByProductId({ productId: spuId })
                    if(updatedSpu)
                        throw new BadRequestError('Update spu stock failed! Pls hot fix')
                }
                channel.ack(msg)
            } catch (error) {
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
    consumerOrderFailed
}