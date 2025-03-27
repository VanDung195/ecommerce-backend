'use strict'

const { AuthFailureError, BadRequestError } = require("../core/error.response")
const { getOneSellerAffiliateByUserId } = require("../models/repositories/sellerAffiliate.repo")

const checkSellerAffiliatePermission = async(req, res, next) => {
    try {
        const user = req.user
        const foundSellerAffiliate = await getOneSellerAffiliateByUserId(user.userId)
        if(!foundSellerAffiliate)
            throw new AuthFailureError('Seller affiliate not registed')
        if(!foundSellerAffiliate.verified)
            throw new BadRequestError('Unverified seller affiliate')
        if(foundSellerAffiliate.status !== 'active')
            throw new BadRequestError('Seller affiliate is not active')
        req.affiliate = foundSellerAffiliate
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = checkSellerAffiliatePermission