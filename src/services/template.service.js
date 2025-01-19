'use strict'

const { htmlConfirmTokenEmail } = require('../utils/otp_email.html')
const { findTemplate, insertTemplate} = require('../models/repositories/template.repo')
const { BadRequestError} = require('../core/error.response')

const newTemplate = async ({
    tem_name, 
    tem_html
}) => {
    //1. check template exists
    const foundTem = await findTemplate({
        tem_name
    })
    if(foundTem) 
        throw new BadRequestError('Template already exists!')
    try {
        //2. insert template into db
        const newTem = await insertTemplate({
            tem_name,
            tem_html: htmlConfirmTokenEmail
        })
        return newTem
    } catch (error) {
        return error
    }
}
const findTemplateService = async ({ 
    tem_name,
}) => {
    const template = await findTemplate({
        tem_name
    })
    if(!template) throw new BadRequestError('Template not found')

    return template
}
module.exports = {
    newTemplate,
    findTemplateService
}