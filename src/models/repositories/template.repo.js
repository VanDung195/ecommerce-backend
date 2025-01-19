'use strict'

const TEMPLATE_MODEL = require('../../models/template.model')

const insertTemplate = async ({
    tem_name,
    tem_html
}) => {
    const newTem = await TEMPLATE_MODEL.create({
        tem_name,
        tem_html
    })

    return newTem
}

const findTemplate = async ({
    tem_name
}) => {
    const template = await TEMPLATE_MODEL.findOne({
        tem_name
    })
    return template
}

const deleteTemplate = async({
    tem_name
}) => {

}

const activeTemplate = async ({
    tem_name
}) => {

}

const inactiveTemplate = async ({
    tem_name
}) => {

}

module.exports = {
    insertTemplate,
    deleteTemplate,
    activeTemplate,
    inactiveTemplate,
    findTemplate
}