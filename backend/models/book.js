import { Schema, model } from "mongoose";

const book = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    isbn: {
      type: String,
      required: false,
    },
    images: [
      {
        type: String,
      },
    ],
    publisher: {
      type: String,
      required: false,
    },
    publishedDate: {
      type: String,
      required: false,
    },
    pageCount: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true },
);

export default model("books", book);
