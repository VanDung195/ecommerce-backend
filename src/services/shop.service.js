'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const { createShop, findShopByUserId, findShopById, disableShop, verifyShop } = require("../models/repositories/shop.repo")
const { updateShopRole } = require("../models/repositories/user.repo")

class ShopService{
    newShop = async({
        userId,
        name,
        email,
        address,
        phone
    }) => {
        try {
            const foundShop = await findShopByUserId({ userId})
            if(foundShop) throw new BadRequestError('Shop already exists')

            const newShop = await createShop({
                userId: userId,
                shop_name: name,
                shop_email: email,
                shop_address: address,
                shop_phone: phone
            })
            if(!newShop) throw new BadRequestError('A system error occurred. Please try again later')
    
            const updateRole = await updateShopRole({ userId, role: 'Shop'})
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
        try {
            if(!userId) throw new BadRequestError('User not registed')
        
            const foundShop = await findShopByUserId({ userId})
            if(!foundShop) throw new NotFoundError('Shop not found')
            
            return foundShop
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    disableShop = async({
        shopId
    }) => {
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

    deleteShop = async({
        shopId
    }) => {
        try {
            
        } catch (error) {
            
        }
    }
}

module.exports = new ShopService()