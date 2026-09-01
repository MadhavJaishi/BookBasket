import { Schema, Types, model } from "mongoose";

const activitySchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "FINISHED_BOOK",
        "RATED_BOOK",
        "ADDED_WANT_TO_READ",
        "STARTED_READING",
        "CREATED_DISCUSSION",
        "JOINED_CLUB",
      ],
      required: true,
    },
    book: {
      type: Types.ObjectId,
      ref: "books",
    },
    review: {
      type: Types.ObjectId,
      ref: "review",
    },
    discussion: {
      type: Types.ObjectId,
      ref: "discussion",
    },
    bookClub: {
      type: Types.ObjectId,
      ref: "bookClub",
    },
    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default model("activity", activitySchema);
