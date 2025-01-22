'use strict'

const { getIORedis } = require('../../dbs/init.ioredis')
const redisCache = getIORedis().instanceConnect

const setCache = async ({
    key,
    value
}) => {
    if(!redisCache) throw new Error('Redis client not initialize')
    try {
        return await redisCache.set(key, value)
    } catch (error) {
        throw new Error(`${error.messgae}`)
    }
}

const getCache = async ({
    key
}) => {
    if(!redisCache) throw new Error('Redis client not initialize')
    try {
        return await redisCache.get(key)
    } catch (error) {
        throw new Error(`${error.messgae}`)
    }
}

const setCacheExpiration = async ({
    key,
    value,
    expiration
}) => {
    if(!redisCache) throw new Error('Redis client not initialize')
    try {
        return await redisCache.set(key, value, 'EX', expiration)
    } catch (error) {
        throw new Error(`${error.messgae}`)
    }
}

const deleteCache = async ({
    key
}) => {
    if(!redisCache) throw new Error('Redis client not initialize')
    try {
        return await redisCache.del(key)
    } catch (error) {
        throw new Error(`${error.messgae}`)
    }
}

module.exports = {
    setCache,
    getCache,
    setCacheExpiration,
    deleteCache
}