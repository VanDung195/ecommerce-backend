'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const { createShop, findShopByUserId, findShopById, disableShop, verifyShop, findShopByEmail, findALlShop } = require("../models/repositories/shop.repo")
const { updateShopRole } = require("../models/repositories/user.repo")

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
            const foundShop = await findShopByUserId({ userId})
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
    
            const updateRole = await updateShopRole({ userId, role: 'shop'})
            if(!updateRole) throw new BadRequestError('Failed to update user role.')
    
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
            const foundShop = await findShopById({ shopId})
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
            const foundShop = await findShopById({ shopId})
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
        limit,
        page,
    }) => {
        try {
            const shops = findALlShop({
                limit: +limit,
                page: +page,
                sort: 'ctime',
                filter: {
                    shop_status: 'active',
                    shop_verify: true
                },
                select: ['shop_name', 'shop_email', 'shop_address', 'shop_phone', 'shop_logo', 'shop_type'],
            })

            return shops
        } catch (error) {
            console.error(error)
            return error
        }
    }

    deleteShop = async({
        shopId
    }) => {
        try {
            
        } catch (error) {
            
        }
    }
}

module.exports = new ShopService()