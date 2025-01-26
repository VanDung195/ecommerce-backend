'use strict'
const { insertOtp, findOtpByToken, deleteOtp, findOtpByEmail } = require('../models/repositories/otp.repo')
const { BadRequestError } = require('../core/error.response')


const newOtp = async (email) => {
    const token = await insertOtp(email)
    return token
}
const findOtpByTokenService = async ({ token}) => {
    const otp = await findOtpByToken({ token })
    return otp
}
const deleteOtpService = async({token}) => {
    deleteOtp({token})
}
const findOtpByEmailService = async ({ email}) => {
    const otp = await findOtpByEmail({ email })
    return otp
}

module.exports = {
    newOtp,
    findOtpByTokenService,
    findOtpByEmailService,
    deleteOtpService
}