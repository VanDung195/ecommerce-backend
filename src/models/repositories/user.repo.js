'use strict'

const USER = require('../user.model')

const createUser = async ({
    username,
    email,
    passwordHash
}) => {
    const newUser = await USER.create({
        usr_name: username,
        usr_email: email,
        usr_password: passwordHash
    })
    return newUser
}

const findUserByEmail = async (email) => {
    const user = await USER.findOne({
        usr_email: email
    })
    return user
}

const updateShopRole = async ({
    userId,
    role
}) => {
    const filter = { _id: userId},
            update = {usr_role: role},
            options = { new: true}
    const user = await USER.updateOne(filter, update, options)
    return user
}

module.exports = {
    createUser,
    findUserByEmail,
    updateShopRole
}