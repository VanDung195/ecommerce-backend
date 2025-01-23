'use strict'

const crypto = require('crypto')
const pick = require('lodash/pick')
const mongoose = require('mongoose')

const getInfoData = ({
    fields = [],
    object = {}
}) => {
    return pick(object, fields) 
}

const generatorRandomToken = () => {
    const token = crypto.randomInt(0, (Math.pow(2, 32)))
    return token
}

const replacePlaceHolder = ( template, params) => {
    Object.keys(params).forEach( k => {
      const placeholder = `{{${k}}}`
      console.log(`Replacing placeholder: ${placeholder} with value: ${params[k]}`);
      template = template.replace( new RegExp(placeholder, 'g'), params[k])
    })

    return template
}

const convertToObjectIdMongodb = id => new mongoose.Types.ObjectId(id)

const getSelectData = (select = []) => {
    return Object.map(select.map(el => [el, 1]))
}


module.exports = {
    generatorRandomToken,
    replacePlaceHolder,
    getInfoData,
    convertToObjectIdMongodb,
    getSelectData
}