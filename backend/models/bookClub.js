import { Schema, Types, model } from "mongoose";

const bookClubSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    currentBook: {
      type: Types.ObjectId,
      ref: "books",
    },
    members: [
      {
        type: Types.ObjectId,
        ref: "user",
      },
    ],
    coverImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
    },
  },
  { timestamps: true }
);

export default model("bookClub", bookClubSchema);
