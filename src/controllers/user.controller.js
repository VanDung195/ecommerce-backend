'use strict'

const { SuccessResponse } = require("../core/success.response")
const { login } = require("../services/access.service")
const { newUserService, checkUserToken, sigupUser, blockUserService, unBlockUserService } = require("../services/user.service")

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

    login = async (req, res, next) => {
        new SuccessResponse({
            message: 'Login successfuly',
            metadata: await login(req.body)
        }).send(res)
    }

    blockUser = async(req, res, next) => {
        new SuccessResponse({
            message: 'Block user successfuly',
            metadata: await blockUserService(req.body)
        }).send(res)
    }

    unBlockUser = async(req, res, next) => {
        new SuccessResponse({
            message: 'Un block user successfuly',
            metadata: await unBlockUserService(req.body)
        }).send(res)
    }
}


module.exports = new UserController()