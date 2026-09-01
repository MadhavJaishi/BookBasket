import { Schema, Types, model } from "mongoose";

const discussionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    book: {
      type: Types.ObjectId,
      ref: "books",
    },
    bookClub: {
      type: Types.ObjectId,
      ref: "bookClub",
    },
    likes: [
      {
        type: Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
);

export default model("discussion", discussionSchema);
