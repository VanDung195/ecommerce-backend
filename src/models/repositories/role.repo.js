'use strict'

const { convertToObjectIdMongodb } = require('../../utils')
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

const findRoleByName = async(name) => {
    const foundRole = await ROLE.findOne({
        rol_name: new RegExp(`^${name}$`, 'i')
    });
    return foundRole;
};


const findRoleBySlug = async(slug) => {
    const foundRole = await ROLE.findOne({
        rol_slug: new RegExp(`^${slug}$`, 'i')
    })
    return foundRole
}

const listRole = async() => {
    const roles = await ROLE.find({}).lean()
    return roles
}

const listRoleForRBAC = async() => {
    const roles = await ROLE.aggregate([
        {
            $unwind: '$rol_grants'
        },
        {
            $lookup: {
                from: 'Resources',
                localField: 'rol_grants.resourceId',
                foreignField: '_id',
                as: 'resource'
            }
        },
        {
            $unwind: '$resource'
        },
        {
            $project: {
                role: '$rol_name',
                resource: '$resource.src_name',
                actions: '$rol_grants.actions',
                attributes: '$rol_grants.attributes'
            }
        },
        {
            $unwind: '$actions'
        },
        {
            $project: {
                _id: 0,
                role: 1,
                resource: 1,
                action: '$actions',
                attributes: 1
            }
        }
    ])
    return roles
}

const getGrantsDetailBySlug = async({slug}) => {
    const grants = await ROLE.aggregate([
        {
            $match: {
                rol_slug: slug
            }
        },
        {
            $unwind: '$rol_grants'
        },
        {
            $lookup: {
                from: 'Resources',
                localField: 'rol_grants.resourceId',
                foreignField: '_id',
                as: 'resource'
            }
        },
        {
            $unwind: '$resource'
        },
        {
            $project: {
                _id: 0,
                role_id: '$_id',
                resourceId: '$resource._id',
                resource_name: '$resource.src_name',
                resource_description: '$resource.src_description',
                actions: '$rol_grants.actions',
                attributes: '$rol_grants.attributes'
            }
        },
        // {
        //     $unwind: '$actions'
        // }
    ])
    return grants
}

const getGrantsDetailById = async({roleId}) => {
    const grants = await ROLE.aggregate([
        {
            $match: {
                _id: convertToObjectIdMongodb(roleId)
            }
        },
        {
            $unwind: '$rol_grants'
        },
        {
            $lookup: {
                from: 'Resources',
                localField: 'rol_grants.resourceId',
                foreignField: '_id',
                as: 'resource'
            }
        },
        {
            $unwind: '$resource'
        },
        {
            $project: {
                _id: 0,
                role_id: '$_id',
                resourceId: '$resource._id',
                resource_name: '$resource.src_name',
                resource_description: '$resource.src_description',
                actions: '$rol_grants.actions',
                attributes: '$rol_grants.attributes'
            }
        },
    ])
    return grants
}

const updateRole = async () => {

}

const updateRoleGrant = async ({
    roleId,
    resourceId,
    actions = [],
    attributes = []
}) => {

}

const addRoleGrant = async({
    roleId,
    resourceId,
    actions = [],
    attributes
}) => {
    const roleObjectId = convertToObjectIdMongodb(roleId)
    console.log(roleObjectId);
    
    const filter = { _id: roleObjectId},
    update = {
        $addToSet: {
            'rol_grants': {
                resourceId: convertToObjectIdMongodb(resourceId),
                actions: actions,
                attributes: attributes
            }
        }
    }, options = { new: true}
    const roleGrant = await ROLE.findOneAndUpdate(filter, update, options)
    
    return roleGrant
}

const deleteRoleGrant = async({

}) => {

}
module.exports = {
    createRole,
    listRole,
    findRoleByName,
    findRoleBySlug,
    listRoleForRBAC,
    getGrantsDetailBySlug,
    getGrantsDetailById,
    addRoleGrant
}