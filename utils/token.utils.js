const jwt = require("jsonwebtoken");
// const { JWT_SECRET } = require("../config");
const decodeJwt = require("jwt-decode");
// const userSchema = require("../model/user.model");
const {userSchema} = require("../PostgresModels");
require("dotenv").config();

const createJwtToken = (payload) => {
  try {
    const token = jwt.sign(payload, process.env.SECRETKEY, {
      expiresIn: "900h",
    });
    return token;
  } catch (error) {
    console.log(error.message);
  }
};
const verifyJwtToken = async (req, res, next) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["access-token"];
    if (!token) {
      res
        .status(400)
        .json({ status: "error", message: "Enter token to proceed" });
      return;
    }
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const decodedData = decodeJwt(token);
    const user = await userSchema.findOne({ where: { id: decodedData.user } });
    const superAdminId = await userSchema.findOne({
      where: { role: "SADMIN" },
    });
    if (!superAdminId) {
      console.log("Initiate Seeders");
    }
    if (!user) {
      res.status(400).json({ status: "error", message: "User not found" });
      return;
    }
    req.user = user.dataValues;
    req.superAdminData = superAdminId.dataValues;
    req.superAdminId = superAdminId.dataValues.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(400).json({ status: "error", message: "Token is Expired" });
    } else {
      res.status(400).json({ status: "error", message: error.message });
    }
  }
};

module.exports = { createJwtToken, verifyJwtToken };
