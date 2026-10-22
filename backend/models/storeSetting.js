import { Schema, model } from "mongoose";

const storeSetting = new Schema(
  {
    autoRandomDiscount: {
      type: Boolean,
      default: false,
    },
    minRandomPercent: {
      type: Number,
      default: 5,
    },
    maxRandomPercent: {
      type: Number,
      default: 35,
    },
  },
  { timestamps: true }
);

export default model("storeSettings", storeSetting);
