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

module.exports = {
    createUser,
    findUserByEmail
}