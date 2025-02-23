'use strict'

const { getIORedis } = require('../dbs/init.ioredis')
const redisCache = getIORedis().instanceConnect
const { v4: uuidv4} = require('uuid')
const { reservationInventory } = require('../models/repositories/inventory.repo')

const aquireLock = async({ productId, quantity, cartId}) => {
    const key = `lock_product_${productId}`
    const uniqueValue = uuidv4()
    const retryTimes = 10
    const expireTime = 3000

    for(let i = 0; i < retryTimes; i++){
        const result = await redisCache.set(key, uniqueValue, 'NX', 'PX', expireTime)
        if(result){
            const isReservation = await reservationInventory({ productId, quantity, cartId})

            if(isReservation.modifiedCount){
                return { key, uniqueValue}
            }

            return null
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async({ keyLock, expectedValue}) => {
    const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
    `;
    return await redisCache.eval(luaScript, 1, keyLock, expectedValue);
}

module.exports = {
    aquireLock,
    releaseLock
}