import { Schema, Types, model } from "mongoose"

const order = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "user",
    },
    book: {
        type: Types.ObjectId,
        ref: "books",
    },
    status: {
        type: String,
        default: "Order placed",
        enum: ["Order placed", "Out for delivery", "Delivered", "Cancelled"]
    }
}, {timestamps: true})
export default model("order", order)