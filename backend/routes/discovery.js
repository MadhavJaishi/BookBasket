import express from "express";
const router = express.Router();
import { authenticateToken } from "./userAuth.js";
import Book from "../models/book.js";
import UserBook from "../models/userBook.js";
import User from "../models/user.js";

const getUserId = (req) => {
  return req.headers.id || req.headers.userid || req.user?.id;
};

// Mood mappings for book discovery
const MOOD_MAP = {
  learn: ["Non-Fiction", "Self-Help", "Psychology", "Business", "History", "Science", "Philosophy"],
  grow: ["Self-Help", "Personal Growth", "Psychology", "Productivity", "Mindfulness"],
  emotional: ["Fiction", "Romance", "Drama", "Memoir", "Poetry", "Literary Fiction"],
  perspective: ["Philosophy", "Sociology", "Biography", "History", "Non-Fiction", "Culture"],
  inspired: ["Biography", "Inspirational", "Entrepreneurship", "Success", "Business"],
  challenging: ["Philosophy", "Classics", "Sci-Fi", "Science", "Complex Fiction"],
  relaxing: ["Fiction", "Cozy", "Fantasy", "Humor", "Graphic Novel", "Young Adult"],
};

// GET /api/v1/discovery/recommendations - Modular rule-based recommendation service
router.get("/discovery/recommendations", async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader || req.headers.id || req.headers.userid) {
      userId = getUserId(req);
    }

    let recommendedBooks = [];
    let reason = "Popular across the platform";

    if (userId) {
      const user = await User.findById(userId);
      const userBooks = await UserBook.find({ user: userId }).populate("book");
      const readOrSavedBookIds = new Set(userBooks.map((ub) => String(ub.book?._id)));
      if (user?.favourites) {
        user.favourites.forEach((favId) => readOrSavedBookIds.add(String(favId)));
      }

      // Collect user preferred genres
      const preferredGenres = new Set(user?.favoriteGenres || []);
      userBooks.forEach((ub) => {
        if (ub.book?.genre) preferredGenres.add(ub.book.genre);
      });

      if (preferredGenres.size > 0) {
        const genreList = Array.from(preferredGenres);
        const candidates = await Book.find({
          genre: { $in: genreList.map((g) => new RegExp(g, "i")) },
        }).limit(12);

        recommendedBooks = candidates.filter(
          (book) => !readOrSavedBookIds.has(String(book._id))
        );
        reason = `Based on your interest in ${genreList.slice(0, 3).join(", ")}`;
      }
    }

    // Fallback if not enough recommendations
    if (recommendedBooks.length < 4) {
      const fallback = await Book.find({}).sort({ likes: -1, createdAt: -1 }).limit(8);
      const existingIds = new Set(recommendedBooks.map((b) => String(b._id)));
      fallback.forEach((b) => {
        if (!existingIds.has(String(b._id))) {
          recommendedBooks.push(b);
        }
      });
      if (!userId) reason = "Discover popular books trending today";
    }

    return res.status(200).json({
      status: "Success",
      reason,
      data: recommendedBooks.slice(0, 8),
    });
  } catch (error) {
    console.error("Error in discovery recommendations:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// GET /api/v1/discovery/mood/:moodKey - Explore books by mood
router.get("/discovery/mood/:moodKey", async (req, res) => {
  try {
    const { moodKey } = req.params;
    const targetGenres = MOOD_MAP[moodKey.toLowerCase()] || ["Fiction", "Non-Fiction"];

    const genreRegexes = targetGenres.map((g) => new RegExp(g, "i"));
    const books = await Book.find({
      $or: [
        { genre: { $in: genreRegexes } },
        { desc: { $in: genreRegexes } },
      ],
    }).limit(12);

    return res.status(200).json({
      status: "Success",
      mood: moodKey,
      genres: targetGenres,
      data: books,
    });
  } catch (error) {
    console.error("Error in mood discovery:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/discovery/natural-language - Natural language book discovery search
router.post("/discovery/natural-language", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ msg: "Query text is required" });
    }

    const cleanQuery = query.trim().toLowerCase();
    const words = cleanQuery
      .replace(/[^\w\s]/gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    // Build smart regex search across title, author, genre, desc
    const regexes = words.map((w) => new RegExp(w, "i"));

    const matches = await Book.find({
      $or: [
        { title: { $in: regexes } },
        { author: { $in: regexes } },
        { genre: { $in: regexes } },
        { desc: { $in: regexes } },
      ],
    }).limit(10);

    let result = matches;
    if (result.length === 0) {
      // Fallback search with single word or top books
      result = await Book.find({}).limit(6);
    }

    return res.status(200).json({
      status: "Success",
      query,
      matchCount: result.length,
      data: result,
      interpretation: `Found matches matching topics: ${words.slice(0, 4).join(", ")}`,
    });
  } catch (error) {
    console.error("Error in natural language discovery:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
