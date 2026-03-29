import express, { json } from "express";
const app = express();
import "./conn/conn.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
app.use(cors());
app.use(json());
import conn from "./conn/conn.js";
conn();
import User from "./routes/user.js";
import Book from "./routes/book.js";
import Favourites from "./routes/favourites.js";
import Cart from "./routes/cart.js";
import Order from "./routes/order.js";
app.use("/api/v1", User);
app.use("/api/v1", Book);
app.use("/api/v1", Favourites);
app.use("/api/v1", Cart);
app.use("/api/v1", Order);

app.listen(process.env.PORT, () => {
  console.log(`Server created on the port ${process.env.PORT} successfully`);
});
