const configSchema = require("../model/setting.model");
const userModel = require("../model/user.model");
const axios = require("axios");
const nodemailer = require("nodemailer");
require('dotenv').config()

const sendOtp = async (phoneNumber) => {
  try {
  const url = await configSchema.find({ smsUrl: { $exists: true } });
  const msgUrl = url[0].smsUrl;
  var otpUrl = new URL(msgUrl);
  var otp = Math.floor(100000 + Math.random() * 900000);
  otpUrl.searchParams.set("mobileno", `${phoneNumber}`);
  otpUrl.searchParams.set(
    "message",
    `${otp} is your one-time passcode (OTP) to login - BSE EBIX`
  );
 await axios.request({
    method: "post",
    url: otpUrl,
    })
    return otp;

  } catch (error) {
    console.log(error.message);
  }
}
const sendMailOtp = async(userMail)=>{
  try {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.PORTOTP,
    secure: false,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });
  console.log(userMail);
  const mailOptions = {
    from: 'mkstats1@gmail.com',
    to: `${userMail}`,
    subject: "Hello ",
    text: "Your otp for BSEEBIX is " + `${otp}`,
  }
  await transporter.sendMail(mailOptions)
  console.log(otp,"otp22");
  return otp;

  } catch (error) {
    console.log(error.message);
  }
}
const verifyOtp= async(req,res)=>{
try {
    const {userphoneNumber,userMail} = req.body;
    const otp = req.body.otp;
    const userphone =await userModel.findOne({userphoneNumber:userphoneNumber})
    const email = await userModel.findOne({userMail:userMail});
    if(!otp && !userphoneNumber && !userMail){
        res.status(400).json({status:"error",message:"Please Enter Otp and Phone number to proceed"})
        return;
    }
    // if(userphone.phoneOtp!==otp){
    //     res.status(400).json({status:"error",message:"Please Enter correct Otp"})
    //     return;
    // }
    if(!userphoneNumber && userMail && otp){
        if(email.mailOtp!=otp){
            res.status(400).json({status:"error",message:"Please Enter correct Otp"})
                return;
        }
    }
    userphone.phoneOtp=null;
    userphone.verified="True";
    await userphone.save();
    res
      .status(201)
      .json({
        staus: "success",
        message: "Otp verified successfully",
        data: { token: userphone.token },
      });
  } catch (error) {
    res.status(400).json({ status: "error", message: error });
  }
};

module.exports = { sendOtp, verifyOtp ,sendMailOtp};
