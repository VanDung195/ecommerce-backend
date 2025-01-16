'use strict'

const { Schema, model} = require('mongoose'); 

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'

// Declare the Schema of the Mongo model
var keytokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true},
    privateKey: { type: String, required: true},
    publicKey: { type: String, required: true},
    refreshTokenUsed: { type: Schema.Types.Array, default: []},
    refreshToken: { type: String, required: true}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, keytokenSchema);