'use strict'

const { connectToRabbitMQ } = require('../dbs/init.rabbit')

const producerOrderMessage = async ({userId, orderProducts}) => {
    try {
        const { connection, channel } = await connectToRabbitMQ()

        const orderQueue = 'orderQueueProcess'
        const orderExchange = 'orderEx'
        const orderExchangeDLX = 'orderExDLX'
        const orderRoutingKeyDLX = 'orderRoutingKeyDLX'

        //1. create Exchange
        await channel.assertExchange(orderExchange, 'direct', {
            durable: true
        })

        //2. create queue
        const queueResult = await channel.assertQueue(orderQueue, {
            durable: true,
            exclusive: false, //không bị xoá khi client disconnect, cho phép nhiều consumer sử dụng
            deadLetterExchange: orderExchangeDLX,
            deadLetterRoutingKey: orderRoutingKeyDLX
        })

        //3. binding key
        await channel.bindQueue(queueResult.queue, orderExchange)

        const payload = {
            userId,
            orderProducts
        }
        await channel.sendToQueue(queueResult.queue, Buffer.from(JSON.stringify(payload)), {
            // expiration: 10000,
            persistent: true //lưu msg trong disk chứ không phải trên ram, giúp không mất dữ liệu khi sập
        })
        setTimeout(() => {
            connection.close()
        }, 500);
    } catch (error) {
        console.error(error)
    }
}

const producerOrderCancellationEvent = async({ order }) => {
    try {
        const {connection, channel} = await connectToRabbitMQ()
        const cancelOrderQueue = 'cancelOrderQueueProcess'
        const cancelOrderExchange = 'cancelOrderEx'
        const orderExchangeDLX = 'orderExDLX'
        const orderRoutingKeyDLX = 'orderRoutingKeyDLX'
        
        await channel.assertExchange(cancelOrderExchange, 'direct', {
            durable: true
        })
        const queueResult = await channel.assertQueue(cancelOrderQueue, {
            durable: true,
            exclusive: false,
            deadLetterExchange: orderExchangeDLX,
            deadLetterRoutingKey: orderRoutingKeyDLX
        })
        await channel.bindQueue(queueResult.queue, cancelOrderExchange)
        await channel.sendToQueue(queueResult.queue, Buffer.from(JSON.stringify(order)), {
            persistent: true
        })
        setTimeout(() => {
            connection.close()
        }, 500)
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    producerOrderMessage,
    producerOrderCancellationEvent
}