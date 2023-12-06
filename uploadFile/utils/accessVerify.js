const userModel = require('../model/user.model')
const roleModel = require('../model/role.model');

const verifyPermission = (permission) => {
    try {
        return async (req, res, next) => {
            const userRole = req.user.role;
            const role = await roleModel.findOne({ role: userRole });
            const userPermissions = role.permissions;
            console.log(userPermissions, permission);
            const isAllowed = userPermissions.includes(permission);
            if (isAllowed) {
                next();
            }
            else {
                res.status(403).json({ status: "error", message: "Unauthorized" });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}
const verifyRole = (role) => {
    try {
        return async (req, res, next) => {
            if (!role) {
                res.status(400).json({ status: "error", message: "Auth not specified" })
            }
            else {
                const fetchRole = await roleModel.find({ role: role });
                if (!fetchRole) {
                    res.status(400).json({ status: "error", message: "Auth not specified" })
                }
                else {
                    const userRole = req.user.role
                    if (!userRole) {
                        res.status(400).json({ status: "error", message: "Auth not specified" })
                    }
                    else{
                        if(userRole!==role){
                            res.status(401).json({ status: "error", message: "Unauthorized" })
                        }
                        else{
                            next();
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(err.message);
    }
}
module.exports = { verifyPermission, verifyRole }