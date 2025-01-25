'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
const RESOURCE = require('../resource.model')

const createResource = async({
    name,
    slug,
    description = ''
}) => {
    const resource = await RESOURCE.create({
        src_name: name,
        src_slug: slug,
        src_description: description
    })
    return resource
}

const findResourceByName = async( name ) => {
    const foundResource = await RESOURCE.findOne({
        src_name: name
    })
    return foundResource
}
const findResourceBySlug = async( slug ) => {
    const foundResource = await RESOURCE.findOne({
        src_slug: slug
    })
    return foundResource
}


const listResources = async({
    limit = 30,
    page = 1,
    search = ''
}) => {
    const filter = {}
    if(search){
        filter.src_name = { $regex: search, $options: 'i'}
    }
    const skip = (page - 1) * limit
    const resources = await RESOURCE.find(filter)
                        .sort({ createdAt: -1})
                        .skip(skip)
                        .limit(limit)
    const total = await RESOURCE.countDocuments(filter)
    return {
        data: resources,
        pagination: {
            total: total,
            limit: limit,
            page: page,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const getResourceById = async(id) => {
    return await RESOURCE.findOne({
        _id: id
    }).lean()
}

module.exports = {
    createResource,
    listResources,
    findResourceByName,
    findResourceBySlug,
    getResourceById
}