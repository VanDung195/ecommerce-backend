'use strict'

const { SuccessResponse } = require('../core/success.response')
const { newTemplate} = require('../services/template.service')

class TemplateController{
    newTem = async (req, res, next) => {
        const { tem_name, tem_html} = req.body
        new SuccessResponse({
            message: 'New template',
            metadata: await newTemplate({
                tem_name,
                tem_html
            })
        }).send(res)
    }
}

module.exports = new TemplateController()