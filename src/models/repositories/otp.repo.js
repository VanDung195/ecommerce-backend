'use strict'

const OTP_MODEL = require('../../models/otp.model')
const { generatorRandomToken } = require('../../utils')

const newOtp = async ({email}) => {
    const token = generatorRandomToken()
    const newToken = await OTP_MODEL.create({
        otp_token: token,
        otp_email: email
    })
    return newToken.otp_token
}

const findToken = async (token) => {
    const tokenDB = await OTP_MODEL.findOne({
        otp_token: token
    })
    return tokenDB
}

const findOtpByEmail = async ({
    email 
}) => {
    const otp = await OTP_MODEL.findOne({
        otp_email: email
    })
    console.log(otp);
    
    return otp
}
module.exports = {
    newOtp,
    findToken,
    findOtpByEmail
}