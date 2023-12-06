const router = require('express').Router()
const {editPermission,customRolesAndPermissions,assignRoles,fetchRolePermission,fetchUsersPermissions} = require('../controller/role.controller.postgres');
const {verifyJwtToken} = require('../../../utils/token.utils');
const {verifyPermission,verifyRole} = require('../../../utils/accessVerify');

router.post('/custom-Roles' ,verifyJwtToken,verifyRole('ADMIN'),customRolesAndPermissions);
router.post('/assign-Roles' ,verifyPermission(['set-ROLES']),assignRoles);
router.get('/fetch-roles' ,verifyJwtToken,fetchRolePermission)
router.get('/fetch-user-permission' ,verifyJwtToken,fetchUsersPermissions)
router.put('/edit-permission' ,verifyJwtToken,editPermission)



module.exports = router;