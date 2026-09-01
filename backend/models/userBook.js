import { Schema, Types, model } from "mongoose";

const userBookSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    book: {
      type: Types.ObjectId,
      ref: "books",
      required: true,
    },
    status: {
      type: String,
      enum: ["WANT_TO_READ", "CURRENTLY_READING", "FINISHED"],
      default: "WANT_TO_READ",
      required: true,
    },
    currentPage: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    finishedAt: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

userBookSchema.index({ user: 1, book: 1 }, { unique: true });

export default model("userBook", userBookSchema);
