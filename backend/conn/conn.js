const mongoose = require("mongoose");
require("dotenv").config()
const conn = async () => {
    try {
        await mongoose.connect(`${process.env.URI}`);
        console.log("Database connected successfully")
    }
    catch(error) {
        console.log("error");
    }
}
conn();
exports.module = conn