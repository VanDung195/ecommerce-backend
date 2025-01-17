'use strict'

const { Schema, model} = require('mongoose'); 
const slugify = require('slugify')
const { v4: uuidv4 } = require('uuid')

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

var userSchema = new Schema({
    usr_name: { type: String, require: true},
    usr_email: { type: String, require: true},
    usr_password: { type: String, default: ''},
    usr_phone: { type: String, default: ''},
    usr_sex: { type: String, default: ''},
    usr_slug: { type: String, require: true, unique: true},
    usr_avatar: { type: String, default: ''},
    usr_day_of_birth: { type: Date, default: ''},
    // usr_role: { type: Schema.Types.ObjectId, ref: 'Role'},
    usr_role: { type: String, default: 'user'},
    usr_status: { type: String, default: 'pending', enum: ['pending', 'active', 'block']}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});
userSchema.pre('save', async function (next) {
    let baseSlug = slugify(this.usr_name, { lower: true, replacement: '.' });
    let randomNumber = Math.floor(100000 + Math.random() * 900000)
    let usrSlug = `${baseSlug}.${randomNumber}`;
    while (await this.constructor.findOne({ usr_slug: usrSlug })) {
        let randomPart = uuidv4().split('-')[0];
        randomNumber = Math.floor(100000 + Math.random() * 900000)
        usrSlug = `${baseSlug}.${randomNumber}.${randomPart}`;
    }
    this.usr_slug = usrSlug;
    next();
});
module.exports = model(DOCUMENT_NAME, userSchema);