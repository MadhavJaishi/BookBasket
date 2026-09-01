import express from "express";
const router = express.Router();
import { authenticateToken } from "./userAuth.js";
import User from "../models/user.js";
import UserBook from "../models/userBook.js";
import Review from "../models/review.js";
import Activity from "../models/activity.js";

const getUserId = (req) => {
  return req.headers.id || req.headers.userid || req.user?.id;
};

// GET /api/v1/users/:id/profile - Get user public reading profile
router.get("/users/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await User.findById(id)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!userDoc) {
      return res.status(404).json({ msg: "User not found" });
    }

    const library = await UserBook.find({ user: id }).populate("book");
    const reviews = await Review.find({ user: id }).populate("book").sort({ createdAt: -1 });

    const stats = {
      totalRead: library.filter((l) => l.status === "FINISHED").length,
      currentlyReading: library.filter((l) => l.status === "CURRENTLY_READING").length,
      wantToRead: library.filter((l) => l.status === "WANT_TO_READ").length,
      reviewsCount: reviews.length,
      goal: userDoc.readingGoal || { year: 2026, targetBooks: 12 },
    };

    return res.status(200).json({
      status: "Success",
      data: {
        user: userDoc,
        stats,
        library,
        reviews,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// POST /api/v1/users/:id/follow - Follow or unfollow user
router.post("/users/:id/follow", authenticateToken, async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const targetUserId = req.params.id;

    if (String(currentUserId) === String(targetUserId)) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => String(id) !== String(targetUserId)
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => String(id) !== String(currentUserId)
      );
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      status: "Success",
      following: !isFollowing,
      msg: isFollowing ? "Unfollowed user" : "Following user",
    });
  } catch (error) {
    console.error("Error toggling follow:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// GET /api/v1/activity/feed - Fetch social activity feed
router.get("/activity/feed", async (req, res) => {
  try {
    const activities = await Activity.find({})
      .populate("user", "username avatar")
      .populate("book", "title author url price genre")
      .populate("review")
      .sort({ createdAt: -1 })
      .limit(15);

    return res.status(200).json({
      status: "Success",
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
