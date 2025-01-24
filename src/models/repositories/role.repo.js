'use strict'

const ROLE = require('../role.model')

const createRole = async({
    name,
    slug,
    description = '',
    grants = []
}) => {
    const role = await ROLE.create({
        rol_name: name,
        rol_slug: slug,
        rol_description: description,
        rol_grants: grants
    })
    return role
}

const listRole = async({

}) => {

}

const findRoleByName = async(name) => {
    const foundRole = await ROLE.findOne({
        rol_name: name
    })
    return foundRole
}

const findRoleBySlug = async(slug) => {
    const foundRole = await ROLE.findOne({
        rol_slug: slug
    })
    return foundRole
}

const listRoleForAuthorize = async() => {

}
module.exports = {
    createRole,
    listRole,
    findRoleByName,
    findRoleBySlug,
    listRoleForAuthorize
}