import { Schema, Types, model } from "mongoose";

const commentSchema = new Schema(
  {
    discussion: {
      type: Types.ObjectId,
      ref: "discussion",
      required: true,
    },
    author: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
      required: true,
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

export default model("comment", commentSchema);
