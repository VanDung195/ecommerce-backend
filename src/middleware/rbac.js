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
            const role_names = foundUser.usr_role
            for(const role of role_names){
                const permission = await rbac.can(role)[action](resource)
                if(permission.granted){
                    return next()
                }
            }
            throw new AuthFailureError('Permission denied')
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    grantAccess
}