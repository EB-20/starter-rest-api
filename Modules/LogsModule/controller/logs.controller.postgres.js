// const { MongoClient, ObjectId } = require("mongodb");
// const userSchema=require('../../../PostgresModels/user.model')

// require("dotenv").config();

// const returnLogs = async (req, res) => {
//   const client = new MongoClient(process.env.URL);
//   try {
//     const { pageNo = 1, limit = 5 } = req.query;
//     skip = (pageNo - 1) * limit;
//     const user = req.user;
//     const { userId } = req.body;
//     await client.connect();
//     const userDetails = userSchema.findAll({where:{ orgId: new ObjectId(userId) }});
//     let users = [];
//     let logs = [];
//     for await (const user of userDetails) {
//       users.push(user.datavalues.id);
//     }
//     const db = client.db("EB_DB");
//     const coll = db.collection("login_logs");
//     for await (const user of users) {
//       // console.log(user);
//       const cursor = coll
//         .find({ "meta.userId": user.toString() })
//         // .limit(Number(limit))
//         // .skip(skip);
//       for await (const log of cursor) {
//         logs.push(log);
//       }
//     }
//     if (!logs) {
//       res
//         .status(400)
//         .json({ status: "error", message: " Login logs not found" });
//       return;
//     }
//     res.status(200).json({ status: "success", logs, count: logs.length });
//   } catch (e) {
//     res.status(400).json({ status: "error", message: e.message });
//   } finally {
//     await client.close();
//   }
// };

// module.exports = { returnLogs };
