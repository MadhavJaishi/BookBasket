import express from "express";
const router = express.Router();
import { authenticateToken } from "./userAuth.js";
import UserBook from "../models/userBook.js";
import User from "../models/user.js";
import Book from "../models/book.js";
import Activity from "../models/activity.js";

// Helper to get user ID safely from header or decoded token
const getUserId = (req) => {
  return req.headers.id || req.headers.userid || req.user?.id;
};

// GET /api/v1/reading/my-library - Fetch user's library entries
router.get("/reading/my-library", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const entries = await UserBook.find({ user: userId }).populate("book");
    
    const library = {
      WANT_TO_READ: [],
      CURRENTLY_READING: [],
      FINISHED: [],
    };

    entries.forEach((item) => {
      if (item.status && library[item.status]) {
        library[item.status].push(item);
      }
    });

    return res.status(200).json({
      status: "Success",
      data: library,
      raw: entries,
    });
  } catch (error) {
    console.error("Error fetching library:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// DELETE /api/v1/reading/status/:bookId - Remove book from reading tracker
router.delete("/reading/status/:bookId", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { bookId } = req.params;

    await UserBook.findOneAndDelete({ user: userId, book: bookId });
    return res.status(200).json({
      status: "Success",
      msg: "Removed from reading tracker",
      data: null,
    });
  } catch (error) {
    console.error("Error removing reading status:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/reading/status - Add, update, or remove book reading status
router.post("/reading/status", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { bookId, status, currentPage, totalPages } = req.body;

    if (!bookId) {
      return res.status(400).json({ msg: "Book ID is required" });
    }

    if (status === "REMOVE" || status === "NONE" || status === null) {
      await UserBook.findOneAndDelete({ user: userId, book: bookId });
      return res.status(200).json({
        status: "Success",
        msg: "Removed from reading tracker",
        data: null,
      });
    }

    const validStatuses = ["WANT_TO_READ", "CURRENTLY_READING", "FINISHED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid reading status" });
    }

    const bookDoc = await Book.findById(bookId);
    if (!bookDoc) {
      return res.status(404).json({ msg: "Book not found" });
    }

    const pageLimit = totalPages || bookDoc.pageCount || 300;
    let pageNum = currentPage !== undefined ? Number(currentPage) : 0;
    if (status === "FINISHED") {
      pageNum = pageLimit;
    }

    let progressPct = Math.min(100, Math.max(0, Math.round((pageNum / pageLimit) * 100)));

    let existing = await UserBook.findOne({ user: userId, book: bookId });
    let isNewStatus = false;

    if (existing) {
      if (existing.status !== status) isNewStatus = true;
      existing.status = status;
      existing.currentPage = pageNum;
      existing.progressPercentage = progressPct;
      if (status === "CURRENTLY_READING" && !existing.startedAt) {
        existing.startedAt = new Date();
      }
      if (status === "FINISHED") {
        existing.finishedAt = new Date();
      }
      await existing.save();
    } else {
      isNewStatus = true;
      existing = new UserBook({
        user: userId,
        book: bookId,
        status: status,
        currentPage: pageNum,
        progressPercentage: progressPct,
        startedAt: status === "CURRENTLY_READING" ? new Date() : undefined,
        finishedAt: status === "FINISHED" ? new Date() : undefined,
      });
      await existing.save();
    }

    // Log Activity for social feed
    if (isNewStatus) {
      let actType = "ADDED_WANT_TO_READ";
      if (status === "CURRENTLY_READING") actType = "STARTED_READING";
      if (status === "FINISHED") actType = "FINISHED_BOOK";

      await Activity.create({
        user: userId,
        type: actType,
        book: bookId,
        details: `Status set to ${status.replace(/_/g, " ").toLowerCase()}`,
      });
    }

    const updatedDoc = await UserBook.findById(existing._id).populate("book");
    return res.status(200).json({
      status: "Success",
      msg: `Book marked as ${status.replace(/_/g, " ").toLowerCase()}`,
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error updating reading status:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// PATCH /api/v1/reading/progress - Update current page / percentage for currently reading book
router.patch("/reading/progress", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { bookId, currentPage } = req.body;

    if (!bookId || currentPage === undefined) {
      return res.status(400).json({ msg: "Book ID and currentPage are required" });
    }

    let entry = await UserBook.findOne({ user: userId, book: bookId }).populate("book");
    if (!entry) {
      const bookDoc = await Book.findById(bookId);
      if (!bookDoc) {
        return res.status(404).json({ msg: "Book not found" });
      }
      const totalPages = bookDoc.pageCount || 300;
      const pageNum = Math.max(0, Math.min(Number(currentPage), totalPages));
      const progressPct = Math.min(100, Math.round((pageNum / totalPages) * 100));

      entry = new UserBook({
        user: userId,
        book: bookId,
        status: progressPct >= 100 ? "FINISHED" : "CURRENTLY_READING",
        currentPage: pageNum,
        progressPercentage: progressPct,
        startedAt: new Date(),
        finishedAt: progressPct >= 100 ? new Date() : undefined,
      });
      await entry.save();
      await entry.populate("book");

      return res.status(200).json({
        status: "Success",
        msg: "Progress saved and added to library",
        data: entry,
      });
    }

    const totalPages = entry.book?.pageCount || 300;
    const pageNum = Math.max(0, Math.min(Number(currentPage), totalPages));
    const progressPct = Math.min(100, Math.round((pageNum / totalPages) * 100));

    entry.currentPage = pageNum;
    entry.progressPercentage = progressPct;

    if (progressPct >= 100 && entry.status !== "FINISHED") {
      entry.status = "FINISHED";
      entry.finishedAt = new Date();

      await Activity.create({
        user: userId,
        type: "FINISHED_BOOK",
        book: bookId,
        details: `Completed reading ${entry.book?.title || "book"}`,
      });
    }

    await entry.save();

    return res.status(200).json({
      status: "Success",
      msg: "Progress updated successfully",
      data: entry,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// GET /api/v1/reading/goals - Get user's current reading goal & stats
router.get("/reading/goals", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const userDoc = await User.findById(userId);

    const year = new Date().getFullYear();
    const targetBooks = userDoc?.readingGoal?.targetBooks || 12;

    const finishedEntries = await UserBook.find({
      user: userId,
      status: "FINISHED",
    }).populate("book");

    const completedCount = finishedEntries.length;
    let totalPagesRead = 0;
    const genreMap = {};

    finishedEntries.forEach((item) => {
      if (item.book) {
        totalPagesRead += item.book.pageCount || item.currentPage || 0;
        if (item.book.genre) {
          genreMap[item.book.genre] = (genreMap[item.book.genre] || 0) + 1;
        }
      }
    });

    const topGenres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);

    return res.status(200).json({
      status: "Success",
      data: {
        year,
        targetBooks,
        completedCount,
        percentage: Math.min(100, Math.round((completedCount / targetBooks) * 100)),
        remainingBooks: Math.max(0, targetBooks - completedCount),
        totalPagesRead,
        topGenres,
      },
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/reading/goals - Update reading goal target
router.post("/reading/goals", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { targetBooks } = req.body;

    if (!targetBooks || isNaN(targetBooks) || targetBooks <= 0) {
      return res.status(400).json({ msg: "Please enter a valid number of target books." });
    }

    const year = new Date().getFullYear();
    await User.findByIdAndUpdate(userId, {
      readingGoal: { year, targetBooks: Number(targetBooks) },
    });

    return res.status(200).json({
      status: "Success",
      msg: "Reading goal updated!",
      targetBooks: Number(targetBooks),
    });
  } catch (error) {
    console.error("Error updating goal target:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
