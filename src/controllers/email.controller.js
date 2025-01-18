'use strict'

const { SuccessResponse } = require("../core/success.response")
const { sendEmailToken } = require("../services/email.service")

class EmailController{
    sendEmail = async (req, res, next) => {
        const { email} = req.body
        new SuccessResponse({
            message: 'Send email success',
            metadata: await sendEmailToken({ email })
        }).send(res)
    }
}

module.exports = new EmailController()