const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const setRateLimit = require("express-rate-limit") 
app.use(cors("*"));
const morgan = require("morgan");
require("dotenv").config();
const { sequelize } = require("./connection");
const permissionSchema = require("./PostgresModels/permissions.model");
const coveredNotCovered = require("./PostgresModels/coveredNotCovered");
const { runPostgresSeeder } = require("./seeder.Postgres");
const { workerDetails, empPlans, workers } = require("./test");
// const {connection} = require('./connection')
// const {connection} = require('./utils/dbConnection');
// const {pagination} = require('./utils/pagination');
// const {roleSeeder,planSchemaSeeder,planDetailsSchemaSeeder,settingData,runSeeder} = require('./seeder');
// const bodyParser = require('body-parser')
// runSeeder()

// roleSeeder()
// planSelectionSeeder()
// planSeeder()npm i express-rate-limit
// settingData()
// app.use(bodyParser());
// let command = process.argv[2];
// if(command === 'roleSeeder'){
//     roleSeeder()
// }
// else if(command === 'planSelectionSeeder'){
//     planSchemaSeeder()
// }
// else if(command === 'settingData'){
//     settingData()
// }
app.use(morgan("tiny"));

// app.use(cors({
//   origin: '*'
// }));

const limiter = setRateLimit({  
  windowMs: 60,
  max: 5,
  message: "You have exceeded your 5 requests per minute limit.",
  headers: true,
});

app.use(limiter)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/payment", require("./Modules/PaymentModule/route/payment.route"));
app.use("/signup", require("./Modules/SignupModule/route/singup.route"));
app.use("/role", require("./Modules/RoleModule/route/role.route"));
app.use("/seeder", require("./route/seeder.route"));
app.use("/login", require("./Modules/LoginModule/route/login.route"));
app.use(
  "/org",
  require("./Modules/OrganizationInfoModule/route/orgInfo.route")
);
app.use("/emp", require("./Modules/AdminModule/route/employeeInfo.route"));
app.use("/plan", require("./Modules/PlanModule/route/plan.route"));
app.use("/user", require("./Modules/UserModule/route/user.route"));
app.use("/sadmin", require("./Modules/SadminModule/route/sadmin.route"));
app.use("/wls", require("./Modules/WhiteLabel/route/wls.route"));
app.use("/logout", require("./route/logout.route"));
app.use("/complaint", require("./Modules/ComplaintModule/route/complaint.route"));
app.use(
  "/download-pdf",
  require("./Modules/InvoiceModule/route/invoice.route")
);
app.use(
  "/employeeFamily",
  require("./Modules/EmployeeModule/route/employee.route")
);
app.use("/wallet", require("./Modules/Wallet/Router/WalletRouter"));
mongoose
  .connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((err) => console.log(err));
sequelize.authenticate().then(() => {
  console.log("Connected to Postgres");
  app.listen(process.env.PORT, () => {
    console.log(`server running on port no ${process.env.PORT}`);
  });
  sequelize.sync().then(() => {
    runPostgresSeeder();
    //   workers.findAll().then(
    //     async (data) =>
    //       data &&
    //       (await workers.bulkCreate([
    //         { name: "dazzler", email: "kk@gmail.com", empId: 1, planId: 1 },
    //         { name: "dazzler", email: "kk@gmail.com", empId: 2, planId: 2 },
    //         { name: "dazzler", email: "kk@gmail.com", empId: 3, planId: 3 },
    //       ]))
    //   );
    //   workerDetails
    //     .findAll()
    //     .then(
    //       async (data) =>
    //         data &&
    //         (await workerDetails.bulkCreate([
    //           { address: "dafzdfzler" },
    //           { address: "dazfdaszlfer" },
    //           { address: "dazfdffzler" },
    //         ]))
    //     );
    //   empPlans
    //     .findAll()
    //     .then(
    //       async (data) =>
    //         data &&
    //         (await empPlans.bulkCreate([
    //           { planName: "dafzzler" },
    //           { planName: "dazzlfer" },
    //           { planName: "dazfzler" },
    //         ]))
    //     );
    // })();
    // workers
    //   .findOne( {where:{id:3}, include: [{ model: workerDetails }, { model: empPlans }] })
    //   .then((data) => {
    //     console.log(
    //       "arjgfjdggfjdg>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
    //       data.dataValues.workerDetail
    //     );
    //   }).catch((err)=>console.error(err));
  });
});
