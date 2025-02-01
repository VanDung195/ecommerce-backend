'use strict'

const AccessControl = require('accesscontrol');
const { listRoleForRBAC } = require('../models/repositories/role.repo');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findUserById } = require('../models/repositories/user.repo');
const rbac = new AccessControl()

const grantAccess = (action, resource) => {
    return async(req, res, next) => {
        try {
            rbac.setGrants(await listRoleForRBAC())
            const userId = req.user.userId
            const foundUser = await findUserById(userId) 
            if(!foundUser) throw new AuthFailureError('User not registed')
            const role_name = foundUser.usr_role
            
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