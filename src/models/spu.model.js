'use strict'

const { Schema, Types, model} = require('mongoose'); // Erase if already required
const slugify = require('slugify')

const COLLECTION_NAME = 'Spus'
const DOCUMENT_NAME = 'Spu'

var spuSchema = new Schema({
    product_name: { type: String, required: true},
    product_thumb: { type: String, default: ''},
    product_description: { type: String, default: ''},
    product_slug: { type: String, unique: true},
    product_price: { type: Number, required: true},
    product_category: { type: Array, default: []},
    product_quantity: { type: Number, required: true},
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop'},
    product_variations: { type: Array, default: []},
    /*
        [
            {
                images: [],
                name: 'color',
                options: ['red', 'green', 'blue']
            },
            {
                images: [],
                name: 'size',
                options: ['S', 'L', 'XL']
            },
        ]    
    */
    isDraft: { type: Boolean, default: true, index: true, select: false},
    isPublished: { type: Boolean, default: false, index: true, select: false},
    isDeleted: { type: Boolean, default: false}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

spuSchema.pre('save', async function(next){
    if (!this.isModified('product_name')) return next(); 
    let baseSlug = slugify(this.product_name, { lower: true, replacement: '-'})
    let randomNumber = Math.floor(1000000000 + Math.random() * 9000000000)
    let urlSlug = `${baseSlug}.${randomNumber}`
    while(await this.constructor.findOne({ product_slug: urlSlug})){
        let randomNumberSecond = Math.floor(1000000000 + Math.random() * 9000000000)
        urlSlug = `${baseSlug}.${randomNumberSecond}`
    }

    this.product_slug = urlSlug
    next()
})

module.exports = model(DOCUMENT_NAME, spuSchema);