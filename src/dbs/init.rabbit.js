'use strict'

const amqp = require('amqplib')

const connectToRabbitMQ = async() => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost')
        if(!connection)
            throw new Error('Connection not established')
        const channel = await connection.createChannel()

        return { channel, connection }
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    connectToRabbitMQ
}