import express from "express";
const router = express.Router();
import User from "../models/user.js";
import { authenticateToken } from "./userAuth.js";

//add book to favourites
router.put("/add-book-to-favourites", authenticateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers; //id is userid
    const userData = await User.findById(id);
    const isFavourite = userData.favourites.includes(bookid);
    if (isFavourite) {
      return res.status(200).json({ msg: "Book is already in favourites." });
    }
    await User.findByIdAndUpdate(id, { $push: { favourites: bookid } });
    return res.status(200).json({ msg: "Book added to favourites." });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//remove book from favourites
router.put(
  "/remove-book-from-favourites",
  authenticateToken,
  async (req, res) => {
    try {
      const { bookid, id } = req.headers; //id is userid
      const userData = await User.findById(id);
      const isFavourite = userData.favourites.includes(bookid);
      if (isFavourite) {
        await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } });
      }
      return res.status(200).json({ msg: "Book removed from favourites." });
    } catch (error) {
      res.status(500).json({ msg: "Internal server error" });
    }
  },
);

import { getStoreSettings, formatBookWithDiscount } from "./book.js";

//fetch favourites books
router.get("/get-all-favourites", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const settings = await getStoreSettings();
    const data = await User.findById(id).populate("favourites");
    const formattedFavs = (data.favourites || [])
      .filter(Boolean)
      .map((item) => formatBookWithDiscount(item, settings.autoRandomDiscount));

    return res.status(200).json({
      status: "Success",
      data: formattedFavs,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
