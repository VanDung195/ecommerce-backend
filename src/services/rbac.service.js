'use strict'

const { ConflictError, BadRequestError, NotFoundError } = require("../core/error.response")
const { findResourceByName, findResourceBySlug, createResource, listResources, getResourceById } = require("../models/repositories/resource.repo")
const { 
    findRoleByName, 
    findRoleBySlug, 
    createRole, 
    listRole, 
    listRoleForRBAC, 
    getGrantsDetailBySlug, 
    getGrantsDetailByRoleId, 
    addRoleGrant, 
    findRoleById,
    deleteRoleGrant,
    updateRoleGrant
 } = require("../models/repositories/role.repo")
const { convertToObjectIdMongodb } = require("../utils")

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
    grants.map( async grant => {
        const foundResource = await getResourceById(grant.resourceId)
        if(!foundResource) throw new BadRequestError('Grants wrong')
    })
    return newRole
}

const roleListService = async() => {
    const roles = await listRole()
    return roles
}

const getGrantsDetailBySlugService = async({
    role
}) => {
    if(!role) throw new BadRequestError('Role id is required')
    
    const grants = await getGrantsDetailBySlug({ slug: role})
    if(!grants) throw new NotFoundError('Grants not found')
    return grants
}   

const getRoleForRbac = async() => {
    const roles = await listRoleForRBAC()
    return roles
}

const addRoleGrantService = async ({
    roleId,
    resourceId,
    actions = [],
    attributes
}) => {
    try {
        let resourceObjectId;
        try {
            resourceObjectId = convertToObjectIdMongodb(resourceId)
        } catch (error) {
            throw new BadRequestError('Resource id is not valid')
        }
        const foundResource = await getResourceById(resourceObjectId)
        if(!foundResource) throw new BadRequestError('Resource not found')

        const grants = await getGrantsDetailByRoleId({ roleId });
        if(!grants) throw new NotFoundError('Role not found')
        const resourceExists = grants.some(grant => grant.resourceId == resourceId);
        if (resourceExists) {
            throw new ConflictError('Resource already exists');
        }
        
        const resource = await getResourceById(resourceId);
        if (!resource) {
            throw new NotFoundError('Resource not found');
        }

        const roleGrant = await addRoleGrant({ roleId, resourceId, actions, attributes });
        
        if (!roleGrant) {
            throw new BadRequestError('Something went wrong');
        }

        return roleGrant;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const deleteRoleGrantService = async({
    roleId,
    grantId
}) => {
    try {
        let roleObjectId, grantObjectId
        try {
            roleObjectId = convertToObjectIdMongodb(roleId)
            grantObjectId = convertToObjectIdMongodb(grantId)
        } catch (error) {
            throw new BadRequestError('Role or grant is not valid')
        }

        const foundRole = await findRoleById(roleId)
        if(!foundRole) throw new NotFoundError('Role not found')
        
        const foundGrants = await getGrantsDetailByRoleId({ roleId })
        const grantExists = foundGrants.some(grant => grant.grantId == grantId);
        if (!grantExists) {
            throw new ConflictError('Grant not found');
        }

        const delRoleGrant = await deleteRoleGrant({
            roleId,
            grantId
        })
        if(!delRoleGrant) throw new BadRequestError('Something went wrong')

        return delRoleGrant
    } catch (error) {
        console.error(error)
        throw new BadRequestError(`Delete role grant error::${error.message}`)
    }
}

const updateRoleGrantService = async({
    roleId,
    resourceId,
    actions,
    attributes
}) => {
    let roleObjectId, resourceObjectId
    try {
        roleObjectId = convertToObjectIdMongodb(roleId)
        resourceObjectId = convertToObjectIdMongodb(resourceId)
    } catch (error) {
        throw new BadRequestError('Role or grant is not valid')
    }

    const foundRole = await findRoleById(roleId)
    if(!foundRole) throw new NotFoundError('Role not found')

    const resource = await getResourceById(resourceId);
    if (!resource) {
        throw new NotFoundError('Resource not found');
    }

    const roleGrant = await updateRoleGrant({
        roleId,
        resourceId,
        actions,
        attributes
    })
    if(!roleGrant) throw new BadRequestError('Something went wrong')
        
    return roleGrant
}

module.exports = {
    createResourceService,
    listResroucesService,
    createRoleService,
    roleListService,
    getRoleForRbac,
    getGrantsDetailBySlugService,
    addRoleGrantService,
    deleteRoleGrantService,
    updateRoleGrantService
}