import { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      default: "",
    },
    reactions: [
      {
        type: String,
      },
    ],
    isSpoiler: {
      type: Boolean,
      default: false,
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

reviewSchema.index({ user: 1, book: 1 }, { unique: true });

export default model("review", reviewSchema);
