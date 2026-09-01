import { Schema, Types, model } from "mongoose";

const readingGoalSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    targetBooks: {
      type: Number,
      required: true,
      default: 12,
    },
  },
  { timestamps: true }
);

readingGoalSchema.index({ user: 1, year: 1 }, { unique: true });

export default model("readingGoal", readingGoalSchema);
