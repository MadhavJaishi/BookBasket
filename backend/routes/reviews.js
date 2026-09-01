import express from "express";
const router = express.Router();
import { authenticateToken } from "./userAuth.js";
import Review from "../models/review.js";
import UserBook from "../models/userBook.js";
import Activity from "../models/activity.js";

const getUserId = (req) => {
  return req.headers.id || req.headers.userid || req.user?.id;
};

// GET /api/v1/reviews/book/:bookId - Fetch reviews for a specific book
router.get("/reviews/book/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const reviews = await Review.find({ book: bookId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    let avgRating = 0;
    const reactionCounts = {};

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      avgRating = Number((sum / reviews.length).toFixed(1));

      reviews.forEach((r) => {
        if (Array.isArray(r.reactions)) {
          r.reactions.forEach((reaction) => {
            reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
          });
        }
      });
    }

    return res.status(200).json({
      status: "Success",
      data: {
        reviews,
        totalReviews: reviews.length,
        avgRating,
        reactionCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/reviews - Create or update review
router.post("/reviews", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { bookId, rating, text, reactions, isSpoiler } = req.body;

    if (!bookId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Valid rating (1-5) and book ID are required." });
    }

    let review = await Review.findOne({ user: userId, book: bookId });

    if (review) {
      review.rating = Number(rating);
      review.text = text || "";
      review.reactions = Array.isArray(reactions) ? reactions : [];
      review.isSpoiler = Boolean(isSpoiler);
      await review.save();
    } else {
      review = new Review({
        user: userId,
        book: bookId,
        rating: Number(rating),
        text: text || "",
        reactions: Array.isArray(reactions) ? reactions : [],
        isSpoiler: Boolean(isSpoiler),
      });
      await review.save();
    }

    // Also sync rating to userBook entry if present
    await UserBook.findOneAndUpdate(
      { user: userId, book: bookId },
      { rating: Number(rating) }
    );

    // Create activity
    await Activity.create({
      user: userId,
      type: "RATED_BOOK",
      book: bookId,
      review: review._id,
      details: `Rated ${rating} stars`,
    });

    const populatedReview = await Review.findById(review._id).populate("user", "username avatar");

    return res.status(200).json({
      status: "Success",
      msg: "Review submitted successfully!",
      data: populatedReview,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// DELETE /api/v1/reviews/:id - Delete a review
router.delete("/reviews/:id", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    if (String(review.user) !== String(userId)) {
      return res.status(403).json({ msg: "Unauthorized to delete this review" });
    }

    await Review.findByIdAndDelete(id);
    return res.status(200).json({ status: "Success", msg: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/reviews/:id/like - Toggle like on a review
router.post("/reviews/:id/like", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    const hasLiked = review.likes.includes(userId);
    if (hasLiked) {
      review.likes = review.likes.filter((uId) => String(uId) !== String(userId));
    } else {
      review.likes.push(userId);
    }

    await review.save();
    return res.status(200).json({
      status: "Success",
      liked: !hasLiked,
      likeCount: review.likes.length,
    });
  } catch (error) {
    console.error("Error toggling review like:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
