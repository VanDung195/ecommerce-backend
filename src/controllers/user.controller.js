'use strict'

const { SuccessResponse } = require("../core/success.response")
const { newUserService, checkUserToken, sigupUser } = require("../services/user.service")

class UserController{
    newUser = async (req, res, next) => {
        const { email } = req.body
        const response = await newUserService({
            email
        })
        new SuccessResponse(response).send(res)
    }

    checkUserToken = async (req, res, next) => {
        const { token } = req.query
        const response = await checkUserToken({ token })
        new SuccessResponse(response).send(res)
    }

    signUp = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create user success',
            metadata: await sigupUser(req.body)
        }).send(res)
    }
}


module.exports = new UserController()