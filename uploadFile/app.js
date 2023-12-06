const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const  morgan = require('morgan')
require('dotenv').config()
// const {connection} = require('./utils/dbConnection');
// const {pagination} = require('./utils/pagination');
const {roleSeeder,planSchemaSeeder,planDetailsSchemaSeeder,settingData,runSeeder} = require('./seeder');
// const bodyParser = require('body-parser')

runSeeder()
// roleSeeder()
// planSelectionSeeder()
// planSeeder()
// settingData()
// app.use(bodyParser());
let command = process.argv[2];
if(command === 'roleSeeder'){
    roleSeeder()
}
else if(command === 'planSelectionSeeder'){
    planSchemaSeeder()
}
else if(command === 'settingData'){
    settingData()
}
app.use(morgan('tiny'))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/payment' , require('./Modules/PaymentModule/route/payment.route'));
app.use('/signup' , require('./Modules/SignupModule/route/singup.route'));
app.use('/role' , require('./Modules/RoleModule/route/role.route'));
app.use('/seeder' , require('./route/seeder.route'));
app.use('/login',require('./Modules/LoginModule/route/login.route'));
app.use('/org', require('./Modules/OrganizationInfoModule/route/orgInfo.route'));
app.use('/emp',require('./Modules/AdminModule/route/employeeInfo.route'));
app.use('/plan',require('./Modules/PlanModule/route/plan.route'));
app.use('/user', require('./Modules/UserModule/route/user.route'));
app.use('/sadmin', require('./Modules/SadminModule/route/sadmin.route'));
app.use('/wls', require('./Modules/WhiteLabel/route/wls.route'));
app.use('/logout',require('./route/logout.route'));
app.use('/download-pdf', require('./Modules/InvoiceModule/route/invoice.route'));
app.use('/loginLogs', require('./Modules/LogsModule/route/logs.route'))
app.use('/employeeFamily', require('./Modules/EmployeeModule/route/employee.route'))

mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('connected to database')
    app.listen(process.env.PORT, () => {
        console.log(`connected on port ${process.env.PORT}`)
    })
}).catch((err) => console.log(err));



