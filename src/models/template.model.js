'use strict'

const { Schema, model} = require('mongoose')

const DOCUMENT_NAME = 'template'
const COLLECTION_NAME = 'templates'

var templateSchema = new Schema({
    'tem_name': { type: String, required: true, unique: true},
    'tem_status': { type: String, default: 'active', enum: ['active', 'inactive']},
    'tem_html': { type: String, required: true}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, templateSchema)