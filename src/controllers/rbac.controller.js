'use strict'
const {SuccessResponse} = require('../core/success.response')
const { createResourceService, listResroucesService, createRoleService } = require('../services/rbac.service')

class RBACController{
    newResource = async(req, res, next) => {
        new SuccessResponse({
            message: 'Create new resource successfuly',
            metadata: await createResourceService(req.body)
        }).send(res)
    }

    listResources = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get list resource successfuly',
            metadata: await listResroucesService(req.query)
        }).send(res)
    }

    newRole = async(req, res, next) => {
        new SuccessResponse({
            message: 'Create new role successfuly',
            metadata: await createRoleService(req.body)
        }).send(res)
    }
}

module.exports = new RBACController()