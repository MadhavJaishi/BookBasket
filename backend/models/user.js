import { Schema, Types, model } from "mongoose";
const user = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    favourites: [
      {
        type: Types.ObjectId,
        ref: "books",
      },
    ],
    cart: [
      {
        type: Types.ObjectId,
        ref: "books",
      },
    ],
    orders: [
      {
        type: Types.ObjectId,
        ref: "order",
      },
    ],
  },
  { timestamps: true },
);

export default model("user", user);
