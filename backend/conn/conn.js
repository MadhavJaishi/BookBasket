import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const conn = async () => {
  try {
    await connect(`${process.env.URI}`);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("error connecting to db");
  }
};
conn();
export default conn;
