'use strict'
const { insertOtp, findOtpByToken, deleteToken, findOtpByEmail } = require('../models/repositories/otp.repo')
const { BadRequestError } = require('../core/error.response')


const newOtp = async (email) => {
    const token = await insertOtp(email)
    return token
}
const findOtpByTokenService = async ({ token}) => {
    const otp = await findOtpByToken({ token })
    return otp
}
const deleteTokenService = async({token}) => {
    deleteToken({token})
}
const findOtpByEmailService = async ({ email}) => {
    const otp = await findOtpByEmail({ email })
    return otp
}

module.exports = {
    newOtp,
    findOtpByTokenService,
    findOtpByEmailService,
    deleteTokenService
}