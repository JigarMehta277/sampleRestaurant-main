const monoose = require("mongoose");
const config = require("config");
const db = config.get("CONNECTION_STRING");

const connectDB = async () => {
  try {
    await monoose.connect(db);

    console.log("MongoDB sucessfully connected!");
  } catch (err) {
    console.error(err.message);
    //exiting with failure
    process.exit(1);
  }
};

module.exports = connectDB;