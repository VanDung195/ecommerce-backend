'use strict'

const { Schema, model} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Role'
const COLLECTION_NAME = 'Roles'


var roleSchema = new Schema({
    rol_name: { type: String, default: 'user', enum: ['user', 'shop', 'admin']},
    rol_slug: { type: String, required: true},
    rol_status: { type: String, default: 'active', enum: ['active', 'inactive']},
    rol_description: { type: String, default: ''},
    rol_grants: [
        {
            resourceId: { type: Schema.Types.ObjectId, ref: 'Resources', required: true},
            actions: { type: Array, required: true},
            attributes: { type: String, default: '*'}
        }
    ]   
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, roleSchema);