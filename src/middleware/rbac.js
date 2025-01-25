'use strict'

const AccessControl = require('accesscontrol');
const { listRoleForRBAC } = require('../models/repositories/role.repo');
const { AuthFailureError } = require('../core/error.response');
const rbac = new AccessControl()

const grantAccess = (action, resource) => {
    return async(req, res, next) => {
        try {
            rbac.setGrants(await listRoleForRBAC())
            const role_name = req.user.role
            const permission = rbac.can(role_name)[action](resource)
            if (!permission || !permission.granted) {
                throw new AuthFailureError('Permission denied');
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    grantAccess
}