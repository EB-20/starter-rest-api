const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    permissions: [{ type: String }],
    pagePermissions: [{ type: String }]
})
const permission = mongoose.model('permissions', permissionSchema)
module.exports = permission;