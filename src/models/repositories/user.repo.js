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

const addRole = async({ userId, role = 'user'}) => {
    const filter = {
        _id: userId
    }, update = {
        $addToSet: {
            usr_role: role
        }
    }, option = { new: true }

    return await USER.findOneAndUpdate(filter, update, option)
}

const deleteRole = async({ userId, role = 'affiliate'}) => {
    const filter = {
        _id: userId
    }, update = {
        $pull: {
            usr_role: role
        }
    }, option = { new: true }

    return await USER.findOneAndUpdate(filter, update, option)
}

const blockUser = async({
    userId,
    status
}) => {
    const filter = { _id: userId},
        update = { usr_status: status },
        options = { new: true }
    const user = await USER.updateOne(filter, update, options)

    return user
}

const findUserById = async(id) => {
    const user = await USER.findOne({
        _id: id
    })
    return user
}

module.exports = {
    createUser,
    findUserByEmail,
    updateShopRole,
    blockUser,
    findUserById,
    addRole,
    deleteRole
}