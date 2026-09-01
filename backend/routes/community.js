import express from "express";
const router = express.Router();
import { authenticateToken } from "./userAuth.js";
import Discussion from "../models/discussion.js";
import Comment from "../models/comment.js";
import BookClub from "../models/bookClub.js";
import Activity from "../models/activity.js";

const getUserId = (req) => {
  return req.headers.id || req.headers.userid || req.user?.id;
};

// GET /api/v1/discussions - Fetch all discussions
router.get("/discussions", async (req, res) => {
  try {
    const discussions = await Discussion.find({})
      .populate("author", "username avatar")
      .populate("book", "title author url")
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: "Success", data: discussions });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/discussions - Create a discussion
router.post("/discussions", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { title, content, bookId, bookClubId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ msg: "Title and content are required." });
    }

    const discussion = new Discussion({
      title,
      content,
      author: userId,
      book: bookId || undefined,
      bookClub: bookClubId || undefined,
    });

    await discussion.save();

    await Activity.create({
      user: userId,
      type: "CREATED_DISCUSSION",
      discussion: discussion._id,
      details: title,
    });

    const populated = await Discussion.findById(discussion._id)
      .populate("author", "username avatar")
      .populate("book", "title author url");

    return res.status(200).json({
      status: "Success",
      msg: "Discussion posted successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Error posting discussion:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// GET /api/v1/discussions/:id/comments - Fetch comments for discussion
router.get("/discussions/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ discussion: id })
      .populate("author", "username avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json({ status: "Success", data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/discussions/:id/comments - Add comment
router.post("/discussions/:id/comments", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ msg: "Comment text is required" });
    }

    const comment = new Comment({
      discussion: id,
      author: userId,
      text,
    });

    await comment.save();
    const populated = await Comment.findById(comment._id).populate("author", "username avatar");

    return res.status(200).json({
      status: "Success",
      msg: "Comment added",
      data: populated,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// GET /api/v1/book-clubs - Fetch all book clubs
router.get("/book-clubs", async (req, res) => {
  try {
    const clubs = await BookClub.find({})
      .populate("creator", "username avatar")
      .populate("currentBook", "title author url genre")
      .populate("members", "username avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: "Success", data: clubs });
  } catch (error) {
    console.error("Error fetching book clubs:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/book-clubs - Create a book club
router.post("/book-clubs", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, description, currentBookId, coverImage } = req.body;

    if (!name || !description) {
      return res.status(400).json({ msg: "Club name and description are required" });
    }

    const club = new BookClub({
      name,
      description,
      creator: userId,
      members: [userId],
      currentBook: currentBookId || undefined,
      coverImage: coverImage || undefined,
    });

    await club.save();

    return res.status(200).json({
      status: "Success",
      msg: "Book club created successfully!",
      data: club,
    });
  } catch (error) {
    console.error("Error creating book club:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/book-clubs/:id/join - Join or leave a book club
router.post("/book-clubs/:id/join", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const club = await BookClub.findById(id);
    if (!club) {
      return res.status(404).json({ msg: "Book club not found" });
    }

    const isMember = club.members.includes(userId);

    if (isMember) {
      club.members = club.members.filter((mId) => String(mId) !== String(userId));
    } else {
      club.members.push(userId);
      await Activity.create({
        user: userId,
        type: "JOINED_CLUB",
        bookClub: club._id,
        details: `Joined ${club.name}`,
      });
    }

    await club.save();

    return res.status(200).json({
      status: "Success",
      joined: !isMember,
      msg: isMember ? "Left club" : "Joined club",
      memberCount: club.members.length,
    });
  } catch (error) {
    console.error("Error joining/leaving book club:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
