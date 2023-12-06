const { v4: uuidv4 } = require('uuid');
let uuid = uuidv4();
const settings = [{
     app_auth:uuid,
     smsUrl :"https://staging.itzcash.com/samsso/jsp/pushsms.jsp?mobileno=9211906242&message=989337 is your one-time passcode (OTP) to login - BSE EBIX&source=BSEEBX",
     excelTojsonfilePath :"uploads/"

}]
module.exports = {settings};