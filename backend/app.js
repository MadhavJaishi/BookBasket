import express, { json } from "express";
const app = express();
import "./conn/conn.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
app.use(cors());
app.use(express.json());
import conn from "./conn/conn.js";
conn();
import User from "./routes/user.js";
import Book from "./routes/book.js";
import Favourites from "./routes/favourites.js";
import Cart from "./routes/cart.js";
import Order from "./routes/order.js";
import Reading from "./routes/reading.js";
import Reviews from "./routes/reviews.js";
import Discovery from "./routes/discovery.js";
import Social from "./routes/social.js";
import Community from "./routes/community.js";

app.use("/api/v1", User);
app.use("/api/v1", Book);
app.use("/api/v1", Favourites);
app.use("/api/v1", Cart);
app.use("/api/v1", Order);
app.use("/api/v1", Reading);
app.use("/api/v1", Reviews);
app.use("/api/v1", Discovery);
app.use("/api/v1", Social);
app.use("/api/v1", Community);

app.listen(process.env.PORT, () => {
  console.log(`Server created on the port ${process.env.PORT} successfully`);
});
