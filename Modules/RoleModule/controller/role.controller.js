const role = require('../../../model/role.model');
const roleSchema = require('../../../model/role.model');
const configSchema = require('../../../model/setting.model');
const userSchema = require('../../../model/user.model');
const permissionSchema = require('../../../model/permissions.model');

const customRolesAndPermissions = async (req, res) => {
    try {
        let { role, permissions } = req.body
        if (!role) {
            res.status(400).json({ status: "error", message: "Please enter role to proceed" })
            return;
        }
        if (!permissions) {
            res.status(400).json({ status: "error", message: "Please enter permission to proceed" })
            return;
        }
        role = await role.toUpperCase();
        const roleExists = await roleSchema.findOne({ role });
        if (roleExists || role === 'SADMIN') {
            res.status(400).json({ status: "error", message: "Role already exists" });
            return;
        }
        const permissionExists = await permissionSchema.find({ permissions: { $all: [permissions] } });
        console.log(!permissionExists);
        if (!permissionExists) {
            res.status(400).json({ status: "error", message: "permission doesn't exists" })
            return;
        }
        // if(role==="SADMIN"){
        // const {key} = req.body
        // const authKey  = await configSchema.findOne({app_auth:key})
        //     if(!authKey){
        //         res.status(403).json({status:"error",mesasge:"Unauthorized"})
        //         return;
        //     }
        //     if(authKey.app_auth!==key){
        //         res.status(400).json({status:"error",mesasge:"Entered incorrect authKEY"})
        //         return;
        //     }
        //         const addSadmin = new roleSchema({role,permissions})
        //         addSadmin.save()
        //         res.status(201).json({staus:"success",
        //             message:"Added role successfully",data:{roleName:`${role}`,permissions:`${permissions}`}
        //         })
        //     }
        const addNewRole = new roleSchema({ role, permissions })
        addNewRole.save()
        res.status(201).json({
            staus: "success",
            message: "Added role successfully", data: { roleName: `${role}`, permissions: `${permissions}` }
        })

    } catch (error) {
        res.status(400).json({ status: "error", mesasge: error.message })
    }
}
const assignRoles = async (req, res) => {
    try {
        let { userNumber, role } = req.body;
        if (!userNumber) {
            res.status(400).json({ status: "error", message: "Enter user phone number to proceed" });
            return;
        }
        if (!role) {
            res.status(400).json({ status: "error", message: "Enter user role to proceed" });
            return;
        }
        if (userNumber && role) {
            role = await role.toUpperCase();
            const user = await userSchema.findOne({ userphoneNumber: userNumber })
            const roleDb = await roleSchema.findOne({ role: role })
            if (!user) {
                res.status(400).json({ status: "error", message: "User doesn't exists" })
                return;
            }
            if (!roleDb) {
                res.status(400).json({ status: "error", message: "Role doesn't exists" })
                return;
            }
            if (role === user.role) {
                res.status(400).json({ status: "error", message: "This role is already assigned to user" })
                return;
            }
            else {
                if (role === "SADMIN") {
                    const { key } = req.body
                    const authKey = await configSchema.findOne({ app_auth: key })
                    if (!authKey) {
                        res.status(403).json({ status: "error", mesasge: "Unauthorized" })
                        return;
                    }
                    if (authKey.app_auth !== key) {
                        res.status(400).json({ status: "error", mesasge: "Entered incorrect authKEY" })
                        return;
                    }
                    user.role = role
                    user.save()
                    res.status(201).json({
                        staus: "success",
                        message: "Added role successfully", data: { roleName: `${role}` }
                    })
                }
                user.role = role;
                await user.save();
                res.status(201).json({ staus: "success", message: "Added user role successfully", data: { roleName: `${role}` } })
            }
        }
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message })
    }
}
const fetchRolePermission = async (req, res) => {
    try {
        const user = req.user;
        if (user.role === 'ADMIN') {
            const rolePermissions = await roleSchema.find({ role: { $ne: 'SADMIN' } });
            const rolePermissionsArr = rolePermissions.map((val) => {
                return { role: val.role, permissions: val.permissions }
            });
            res.status(200).json({ status: "success", data: rolePermissionsArr });
            return;
        }
        if (user.role === 'SADMIN') {
            const rolePermissions = await roleSchema.find();
            const rolePermissionsArr = rolePermissions.map((val) => {
                return { role: val.role, permissions: val.permissions }
            })
            res.status(200).json({ status: "success", data: rolePermissionsArr });
            return;
        }
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message })
    }
}
const fetchUsersPermissions = async (req, res) => {
    try {
        const { pageNo = 1, limit = 10, searchParam = "" } = req.query;
        const user = req.user;
        const skip = (pageNo - 1) * limit;
        // const allUsers = await userSchema.find({ orgId: user.orgId }, { userName: 1, userphoneNumber: 1, role: 1, permissions: 1 });
        const regx = new RegExp(`^${searchParam}`, "i")
        const allUsers = await userSchema
            .find({
                $and: [{ orgId: user.orgId },
                { role: { $nin: ["SADMIN"] } },
                { userName: { $regex: regx } },
                ],
            }, {userName: 1, userphoneNumber: 1, role: 1, permissions: 1})
            .limit(limit)
            .skip(skip);
        const totalDoc = await userSchema
            .find({
                $and: [{ orgId: user.orgId },
                { role: { $nin: ["SADMIN"] } },
                { userName: { $regex: regx } }
                ],
            }).count()
        if (!allUsers) {
            return res.status(400).json({ status: "error", message: "No user found" });
        }
        const permissions = await permissionSchema.find();
        if (!permissions) {
            return res.status(400).json({ status: "error", message: "Seeder not Initialized" });
        }
        const totalPages = Math.ceil(totalDoc / Number(limit));
        const allPermissions = permissions[0].permissions
        res.status(200).json({
            status: "success", allPermissions, allUsers, currentPage: pageNo,
            totalPages,
            totalDoc,
            limit,
        });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.mesasge })
        console.log(error);
    }

}
const editPermission = async(req,res)=>{
    try {
        const {userId,permissions} = req.body
    const adminUser = req.user    
    const permissionsArr = await permissionSchema.find();
    const allPermissions = permissionsArr[0].permissions
    if(!permissionsArr){
        return res.status(400).json({status:"error",message:"can't find permissions"});
    }
    if(!userId){
        return res.status(400).json({status:"error",message:"provide user ID to change permissions"});
    }   
    if(!permissions){
        return res.status(400).json({status:"error",message:"please select permissions"});
    }
    for(var i =0;i<permissions.length;i++){
        if(!allPermissions.includes(permissions[i])){
            return res.status(400).json({status:"error",message:"permission not found"});
        }
    }
    const user = await userSchema.findOne({_id:userId})
    if(user.orgId===adminUser.orgId){
        return res.status(400).json({status:"error",message:"User doesn't belong to this org"});
    }
    userSchema.findOneAndUpdate({_id:userId},{permissions:permissions},{returnDocument:"after"}).then(()=>{
        res.status(200).json({status:"success",message:`successfully updated ${userId}`})
    })
    } catch (error) {
       res.status(400).json({status:"error",message:err.mesasge});
        
    }
}
module.exports = { customRolesAndPermissions, assignRoles, fetchRolePermission, fetchUsersPermissions ,editPermission}