'use strict'

const { Schema, model} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'otp_log'
const COLLECTION_NAME = 'otp_logs'

var otpSchema = new Schema({
    otp_token: { type: String, required: true},
    otp_email: { type: String, required: true},
    otp_status: { type: String, default: 'pending', enum: ['pending', 'active', 'block']},
    expireAt: {
        type: Date, default: Date.now(), expires: 180
    }
}, {
   timestamps: true,
   collection: COLLECTION_NAME 
});

module.exports = model(DOCUMENT_NAME, otpSchema);