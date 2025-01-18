'use strict'

const nodemailer = require('nodemailer')
// const {newOtp, findOtpByEmail, findOtpByToken} = require('../models/repositories/otp.repo')
const {newOtp, findOtpByTokenService, findOtpByEmailService} = require('../services/otp.service')
const {BadRequestError} = require('../core/error.response')
const { findTemplateService } = require('../services/template.service')
const { replacePlaceHolder } = require('../utils')

let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vdung3002519@gmail.com',
        pass: 'znsdoozstduqgato'
    }
})

const sendEmailLinkVerify = async ({
    html,
    toEmail,
    subject = 'Xác nhân',
    text = 'Xác nhận'
}) => {
    try {
        const mailOptions = {
            from: '"VanDung" <dugvan063@gmail.com',
            to: toEmail,
            subject,
            text,
            html 
        }

        transport.sendMail(mailOptions, (err, info) => {
            if(err) {
                return console.error(err)
            } else {
                console.log(`Message sent::`, info.messageId)
            }
        })
    } catch (error) {
        console.error(`Error sent email:::${error}`)
        return error
    }
}

const sendEmailToken = async ({
    email
}) => {
    try {
        //1. each user only send one otp
        const otp = await findOtpByEmailService({ email })
        if(otp != null) throw new BadRequestError('Otp already exists')
        
        //2. get token
        const token = await newOtp({email})
        //3. check token
        if(!token) throw new BadRequestError('Token not found')
        
        //4. check template
        const template =  await findTemplateService({ 
            tem_name: 'HTML SIGNUP CONFIRM'
        })
        if(!template) throw new BadRequestError('Template not found')

        //5. replace plate holder
        const content = await replacePlaceHolder(
            template.tem_html,
            {
                link_verify: `http://localhost:3052/api/user/welcome?token=${token}`
            }
        )
        //6. send email
        await sendEmailLinkVerify({
            html: content,
            toEmail: email,
            subject: 'Vui lòng xác nhận đăng ký tài khoản!'
        }).catch((error) => {
            console.error(error)
        })
        return 1;
    } catch (error) {
        throw new BadRequestError(error.message)
    }
}

const sendEmailConfirmToken = async ({
    email
}) => {
    const otp = await findOtpByEmailService({ email})
    if(otp) throw new BadRequestError('Otp already exists')
    
    const token = await newOtp({ email })
    if(!token) throw new BadRequestError('Something went wrong! Pls retry')

    const template = await findTemplateService({
        tem_name: 'HTML CONFIRM TOKEN EMAIL'
    })
    if(!template) throw new BadRequestError('Template not found')

    const content = await replacePlaceHolder(
        template.tem_html,
        {
            otp_code: token
        }
    )
    await sendEmailLinkVerify({
        html: content,
        toEmail: email,
        subject: 'Mã xác thực'
    }).catch((error) => {
        console.error(error)
    })

    return 1;
}

module.exports = {
    sendEmailToken,
    sendEmailConfirmToken
}