'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const { createShop, findShopByUserId, disableShop, verifyShop, findShopByEmail, findALlShop, deleteShopByUser, findShopByShopId } = require("../models/repositories/shop.repo")
const { updateShopRole, addRole } = require("../models/repositories/user.repo")

class ShopService{
    newShop = async({
        userId,
        name,
        email,
        address,
        phone
    }) => {
        if(!userId) throw new BadRequestError('User ID is required')

        try {
            const foundShop = await findShopByUserId({ userId })
            if(foundShop) throw new BadRequestError('Shop already exists')
            const foundShopByEmail = await findShopByEmail({ email })
            if(foundShopByEmail) throw new BadRequestError('Email aldready exists')
            
            const newShop = await createShop({
                userId: userId,
                shop_name: name,
                shop_email: email,
                shop_address: address,
                shop_phone: phone
            })
            if(!newShop) throw new BadRequestError('A system error occurred. Please try again later')
            const updatedRole = await addRole({ userId, role: 'shop'})
            if(!updatedRole) throw new BadRequestError('Failed to update user role.')

            return newShop
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    getShopByUserId = async({
        userId
    }) => {
        if(!userId) throw new BadRequestError('User ID is required')
        try {
            const foundShop = await findShopByUserId({ userId})
            if(!foundShop) throw new NotFoundError('Shop not found')
                
            // if(!foundShop.shop_verify) throw new BadRequestError('Shop unverified')
            // if(foundShop.status === 'inactive') throw new BadRequestError('Shop has been banned')

            return foundShop
        } catch (error) {
            console.error(`Error in getShopByUserId for userId ${userId}:`, error.message);
            throw error;
        }
    }

    disableShop = async({
        shopId
    }) => {
        if(!shopId) throw new BadRequestError('Shop ID is required')

        try {
            const foundShop = await findShopByShopId(shopId)
            if(!foundShop) throw new NotFoundError('Shop not found')
            
            const shop = await disableShop({shopId})
            if(!shop) throw new BadRequestError('Failed to disable shop')
    
            return shop
        } catch (error) {
            console.error(error)
            throw error        
        }
    }

    verifyShop = async({
        shopId
    }) => {
        if(!shopId) throw new BadRequestError('Shop ID is required')
        try {
            const foundShop = await findShopByShopId(shopId)
            if(!foundShop) throw new NotFoundError('Shop not found')
            
            const shop = await verifyShop({ shopId})
            if(!shop) throw new BadRequestError('Failed to verify shop')
    
            return shop
        } catch (error) {
            console.error(error)
            throw error        
        }
    }

    getAllShop = async({
        limit = 30,
        page = 1,
        type = ''
    }) => {
        try {
            const filter = {
                shop_status: { $ne: 'deleted' }
            } 
            if(type !== ''){
                filter.shop_verify = type === 'verified' ? true : false
            }
            const shops = await findALlShop({
                limit: +limit,
                page: +page,
                sort: 'ctime',
                filter,
                select: ['shop_name', 'shop_email', 'shop_address', 'shop_phone', 'shop_logo', 'shop_type'],
            })

            return shops
        } catch (error) {
            console.error(error)
            return error
        }
    }

    deleteShopByUserService = async({
        userId,
        shopId
    }) => {
        try {
            return await deleteShopByUser({ shopId, userId })
        } catch (error) {
            console.error(error)
            throw error   
        }
    }
}

module.exports = new ShopService()