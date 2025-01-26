'use strict'
const {SuccessResponse} = require('../core/success.response')
const { createResourceService, listResroucesService, createRoleService, getRoleForRbac, getGrantsDetailBySlugService, addRoleGrantService, deleteRoleGrantService, updateRoleGrantService } = require('../services/rbac.service')

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

    getRoleForRbac = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get role for rbac success',
            metadata: await getRoleForRbac()
        }).send(res)
    }

    getGrantsDetail = async(req, res, next) => {
        new SuccessResponse({
            message: 'Get role grant success',
            metadata: await getGrantsDetailBySlugService(req.query)
        }).send(res)
    }

    addRoleGrant = async(req, res, next) => {
        new SuccessResponse({
            message: 'Add role grant success',
            metadata: await addRoleGrantService(req.body)
        }).send(res)
    }

    deleteRoleGrant = async(req, res, next) => {
        new SuccessResponse({
            message: 'Delete role grant success',
            metadata: await deleteRoleGrantService(req.body)
        }).send(res)
    }

    updateRoleGrant = async(req, res, next) => {
        new SuccessResponse({
            message: 'Update role grant success',
            metadata: await updateRoleGrantService(req.body)
        }).send(res)
    }
}

module.exports = new RBACController()