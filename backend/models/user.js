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
      default: "",
    },
    addresses: [
      {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pinCode: { type: String, default: "" },
        formattedAddress: { type: String, required: true },
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        isPrimary: { type: Boolean, default: false },
        label: { type: String, default: "Home" }, // Home, Work, Other
      },
    ],
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
    bio: {
      type: String,
      default: "Passionate reader exploring new perspectives.",
    },
    favoriteGenres: [
      {
        type: String,
      },
    ],
    readingGoal: {
      year: { type: Number, default: 2026 },
      targetBooks: { type: Number, default: 12 },
    },
    privacy: {
      isPublic: { type: Boolean, default: true },
    },
    followers: [
      {
        type: Types.ObjectId,
        ref: "user",
      },
    ],
    following: [
      {
        type: Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true },
);

export default model("user", user);
