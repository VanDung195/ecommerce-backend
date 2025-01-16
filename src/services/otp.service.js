'use strict'

const crypto = require('crypto')
const { insertOtpLog } = require('../models/repositories/otp.repo')


const newOtp = async (email) => {
    const token = await insertOtpLog(email)
    return token
}

module.exports = {
    newOtp
}