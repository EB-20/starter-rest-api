const {userSchema} = require("../PostgresModels");
// const { loginLog } = require("../utils/logger");
const moment = require("moment");

const logout = async (req, res) => {
  const user = req.user;
  const userlogout = await userSchema.findByPk(user.id);
  if (!userlogout) {
    return res
      .status(400)
      .json({ status: "error", message: "Can't find User" });
  }
  userlogout.token = "";
  await userlogout.save();
  // loginLog.log("info", "Success", {
  //   userId: user.id.toString(),
  //   // LastLogin: user,
  //   logoutTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
  //   remark: "Logged out",
  //   ipAddress: req.ip,
  // });
  res
    .status(200)
    .json({
      status: "success",
      message: `Logout successfull for ${userlogout.userName}`,
    });
};

module.exports = { logout };
