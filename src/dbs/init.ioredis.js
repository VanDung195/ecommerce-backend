'use strict'

const Redis = require('ioredis')
const { RedisErrorResponse } = require('../core/error.response')

let clients = {}
let connectionTimeout = null
let isConnected = false

const REDIS_CONNECT_TIMEOUT = 10000,
    REDIS_CONNECT_MESSAGE = {
        code: -99,
        message: 'Redis connection error'    
    }

const statusConnectionRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: 'reconnecting',
    ERROR: 'error'
}

const handlerTimeoutError = () => {
    if(connectionTimeout) clearTimeout(connectionTimeout)
    connectionTimeout = setTimeout(() => {
        if(!isConnected){
            throw new RedisErrorResponse({
                message: REDIS_CONNECT_MESSAGE.message,
                statusCode: REDIS_CONNECT_MESSAGE.code
            })
        }
    }, REDIS_CONNECT_TIMEOUT)
}




const handlerEventConnection = (connectionRedis) => {
    connectionRedis.on(statusConnectionRedis.CONNECT, () => {
        console.log(`connectionIORedis - Connection status: connected`)
        isConnected = true
        if(connectionTimeout) clearTimeout(connectionTimeout)
    })

    connectionRedis.on(statusConnectionRedis.RECONNECT, () => {
        console.log(`connectionIORedis - Connection status: reconnect`)
        isConnected = false
        if(connectionTimeout) clearTimeout(connectionTimeout)
    })

    connectionRedis.on(statusConnectionRedis.END, () => {
        console.log(`connectionIORedis - Connection status: end`)
        isConnected = false
        handlerTimeoutError()
    })
    connectionRedis.on(statusConnectionRedis.ERROR, () => {
        console.log(`connectionIORedis - Connection status: error`)
        isConnected = false
        handlerTimeoutError()
    })
}

const init = ({
    IOREDIS_IS_ENABLED = true,
    IOREDIS_HOST = 'localhost',
    IOREDIS_PORT = 6379
}) => {
    if(IOREDIS_IS_ENABLED) {
        try {
            const instanceRedis = new Redis({
                host: IOREDIS_HOST,
                port: IOREDIS_PORT
            })

            clients.instanceConnect = instanceRedis
            handlerEventConnection(instanceRedis)
        } catch (error) {
            console.error('Redis initialization failed: ', error)
            handlerTimeoutError()
        }
    }
}

const getIORedis = () => clients

const closeIORedis = () => {
    if(clients.instanceConnect){
        clients.instanceConnect.quit((err) => {
            if(err) {
                console.error('Error closing redis::: ', err)
            } else {
                console.log('Redis closed successfully');
            }
        })
    }
}

module.exports = {
    handlerEventConnection,
    init,
    getIORedis,
    closeIORedis
}