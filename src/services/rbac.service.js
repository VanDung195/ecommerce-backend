'use strict'

const { ConflictError, BadRequestError, NotFoundError } = require("../core/error.response")
const { findResourceByName, findResourceBySlug, createResource, listResources } = require("../models/repositories/resource.repo")
const { findRoleByName, findRoleBySlug, createRole } = require("../models/repositories/role.repo")

// let grantList = [
//     { role: 'user', resource: 'profile', action: 'read:own', attributes: '*' },
//     { role: 'shop', resource: 'profile', action: 'read:own', attributes: '*' }
// ];

const createResourceService = async({
    name,
    slug,
    description
}) => {
    const foundResourceByName = await findResourceByName(name)
    if(foundResourceByName) throw new ConflictError('Resource name already exists')

    const foundResourceBySlug = await findResourceBySlug(slug)
    if(foundResourceBySlug) throw new ConflictError('Resource slug already exists')

    const newResource = await createResource({ name, slug, description})
    if(!newResource) throw new BadRequestError('Create resource failure')
    
    return newResource
}
 
const listResroucesService = async({
    limit,
    page,
    search
}) => {
    const resources = await listResources({
        limit: +limit,
        page: +page,
        search
    })
    if(!resources) throw new NotFoundError('List resource not found')

    return resources
}

/*
    grants = [
        {
            resourceId: 123,
            actions: ['a', 'b']
        },
        {
            resourceId: 345,
            actions: ['a', 'b']
        },
        {
            resourceId: 456,
            actions: ['a', 'b']
        }
    ]
*/

const createRoleService = async({
    name,
    slug,
    description,
    grants = []
}) => {
    const foundRoleByName = await findRoleByName(name)
    if(foundRoleByName) throw new ConflictError('Role name already exists')

    const foundRoleBySlug = await findRoleBySlug(slug)
    if(foundRoleBySlug) throw new ConflictError('Role slug already exists')

    const newRole = await createRole({name, slug, description, grants})
    if(!newRole) throw new BadRequestError('Create role failed')

    //check resource id
    return newRole
}

const roleListService = async() => {

}

module.exports = {
    createResourceService,
    listResroucesService    ,
    createRoleService,
    roleListService
}