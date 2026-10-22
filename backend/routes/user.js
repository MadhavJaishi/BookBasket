import express from "express";
const router = express.Router();
import User from "../models/user.js";
import UserBook from "../models/userBook.js";
import { string } from "zod";
import bcrypt from "bcryptjs";
const { hash, compare } = bcrypt;
import jwt from "jsonwebtoken";
import { authenticateToken } from "./userAuth.js";
const nameSchema = string().min(3).max(30);
const passSchema = string()
  .min(4, { message: "Password must be at least 4 characters long." })
  .max(100, { message: "Password must not exceed 100 characters." });
const emailSchema = string().email();

// In-memory temporary hold store for usernames (held for 5 minutes)
// Key: lowercase username -> { heldAt: number (ms), sessionId: string, originalUsername: string }
const temporaryHeldUsernames = new Map();
const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const cleanExpiredHolds = () => {
  const now = Date.now();
  for (const [key, value] of temporaryHeldUsernames.entries()) {
    if (now - value.heldAt >= HOLD_DURATION_MS) {
      temporaryHeldUsernames.delete(key);
    }
  }
};

// Check if username already exists or is held in temporary session
router.post("/check-username", async (req, res) => {
  try {
    cleanExpiredHolds();
    const { username, sessionId } = req.body;
    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        available: false,
        msg: "Username must be at least 3 characters long.",
      });
    }

    const cleanUsername = username.trim();
    const key = cleanUsername.toLowerCase();

    // 1. Check if user already exists in DB
    const userExists = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
    });

    if (userExists) {
      temporaryHeldUsernames.delete(key);
      return res.status(409).json({
        available: false,
        inTemporarySession: false,
        msg: "Please select another username as this has already been taken.",
      });
    }

    // 2. Check if username is held in temporary session space by another user
    const existingHold = temporaryHeldUsernames.get(key);
    if (existingHold) {
      const isExpired = Date.now() - existingHold.heldAt >= HOLD_DURATION_MS;
      if (!isExpired) {
        // Active hold exists. If held by another user/session:
        if (sessionId && existingHold.sessionId !== sessionId) {
          return res.status(409).json({
            available: false,
            inTemporarySession: true,
            msg: "This username exists in temporary session, Wait for 5 mins if you want to confirm of its unavailability.",
          });
        }
      } else {
        temporaryHeldUsernames.delete(key);
      }
    }

    // 3. Place on hold in temporary space for 5 minutes
    const now = Date.now();
    temporaryHeldUsernames.set(key, {
      heldAt: now,
      sessionId: sessionId || `session_${now}`,
      originalUsername: cleanUsername,
    });

    return res.status(200).json({
      available: true,
      heldAt: now,
      msg: "Username is available and placed on hold for 5 minutes.",
    });
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Release a held username when user clicks Back or changes username
router.post("/release-username", async (req, res) => {
  try {
    const { username, sessionId } = req.body;
    if (username) {
      const key = username.trim().toLowerCase();
      const existing = temporaryHeldUsernames.get(key);
      if (existing && (!sessionId || existing.sessionId === sessionId)) {
        temporaryHeldUsernames.delete(key);
      }
    }
    return res.status(200).json({ status: "Success" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//Signup
router.post("/sign-up", async (req, res) => {
  try {
    cleanExpiredHolds();
    const { username, email, password, address, sessionId } = req.body;

    if (
      !nameSchema.safeParse(username?.trim()).success ||
      !passSchema.safeParse(password).success ||
      !emailSchema.safeParse(email?.trim()).success
    ) {
      res.status(400).json({ msg: "Invalid input credentials" });
      return;
    }
    const cleanUsername = username.trim();
    const key = cleanUsername.toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user already exists in DB
    const userExists = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
    });
    if (userExists) {
      temporaryHeldUsernames.delete(key);
      return res.status(411).json({
        msg: "Please select another username as this has already been taken.",
      });
    }

    // 2. Check if held by another user in active temporary session
    const existingHold = temporaryHeldUsernames.get(key);
    if (existingHold) {
      const isExpired = Date.now() - existingHold.heldAt >= HOLD_DURATION_MS;
      if (!isExpired && sessionId && existingHold.sessionId !== sessionId) {
        return res.status(409).json({
          msg: "This username exists in temporary session, Wait for 5 mins if you want to confirm of its unavailability.",
        });
      }
    }

    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) {
      res.status(411).json({ msg: "Email already used" });
      return;
    }
    const hashPass = await hash(password, 10);
    const initialAddresses = [];
    if (address && address.trim()) {
      initialAddresses.push({
        formattedAddress: address.trim(),
        isPrimary: true,
        label: "Home",
      });
    }

    const newUser = new User({
      username: cleanUsername,
      email: cleanEmail,
      password: hashPass,
      address: address ? address.trim() : "",
      addresses: initialAddresses,
    });
    await newUser.save();

    // Release from temporary hold since successfully created
    temporaryHeldUsernames.delete(key);

    res.status(200).json({ msg: "Signup successful." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

//Signin
router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDetails = await User.findOne({ username: username });
    if (!userDetails) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }
    compare(password, userDetails.password, (err, data) => {
      if (data) {
        const authClaims = [
          { name: userDetails.username },
          { role: userDetails.role },
        ];
        const token = jwt.sign({ authClaims }, "BookBasket", {
          expiresIn: "30d",
        });
        res.status(200).json({
          id: userDetails._id,
          role: userDetails.role,
          token: token,
          msg: "Login Successful",
        });
      } else {
        res.status(500).json({ msg: "Invalid input credentials" });
      }
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//Get user infos
router.get("/get-user-info", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const data = await User.findById(id).select("-password");
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Get user addresses (up to 3)
router.get("/get-addresses", authenticateToken, async (req, res) => {
  try {
    const id = req.headers.id || req.headers.userid;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Auto-migrate legacy string address if addresses array is empty
    if ((!user.addresses || user.addresses.length === 0) && user.address && user.address.trim()) {
      user.addresses = [
        {
          street: "",
          city: "",
          state: "",
          pinCode: "",
          formattedAddress: user.address.trim(),
          isPrimary: true,
          label: "Home",
        },
      ];
      await user.save();
    }

    // Ensure at least one address is marked primary if addresses exist
    if (user.addresses && user.addresses.length > 0) {
      const hasPrimary = user.addresses.some((a) => a.isPrimary);
      if (!hasPrimary) {
        user.addresses[0].isPrimary = true;
        user.address = user.addresses[0].formattedAddress;
        await user.save();
      }
    }

    return res.status(200).json({
      status: "Success",
      data: user.addresses || [],
      primaryAddress: user.addresses?.find((a) => a.isPrimary) || null,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Add new address (max 3 allowed)
router.post("/add-address", authenticateToken, async (req, res) => {
  try {
    const id = req.headers.id || req.headers.userid;
    const { street, city, state, pinCode, formattedAddress, lat, lng, isPrimary, label } = req.body;

    if (!formattedAddress || !formattedAddress.trim()) {
      return res.status(400).json({ msg: "Address details are required." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    if (user.addresses && user.addresses.length >= 3) {
      return res.status(400).json({
        msg: "Maximum of 3 addresses reached. Please delete or edit an existing address.",
      });
    }

    const isFirst = !user.addresses || user.addresses.length === 0;
    const makePrimary = isFirst || Boolean(isPrimary);

    if (makePrimary && user.addresses) {
      user.addresses.forEach((addr) => {
        addr.isPrimary = false;
      });
    }

    const newAddr = {
      street: street || "",
      city: city || "",
      state: state || "",
      pinCode: pinCode || "",
      formattedAddress: formattedAddress.trim(),
      lat: Number(lat) || 0,
      lng: Number(lng) || 0,
      isPrimary: makePrimary,
      label: label || "Home",
    };

    user.addresses.push(newAddr);
    if (makePrimary) {
      user.address = formattedAddress.trim();
    }

    await user.save();

    return res.status(200).json({
      status: "Success",
      msg: "Address added successfully.",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Update an address by ID
router.put("/update-address/:addressId", authenticateToken, async (req, res) => {
  try {
    const id = req.headers.id || req.headers.userid;
    const { addressId } = req.params;
    const { street, city, state, pinCode, formattedAddress, lat, lng, isPrimary, label } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    const addrIndex = user.addresses.findIndex((a) => a._id.toString() === addressId);
    if (addrIndex === -1) {
      return res.status(404).json({ msg: "Address not found." });
    }

    if (isPrimary) {
      user.addresses.forEach((addr) => {
        addr.isPrimary = false;
      });
    }

    if (street !== undefined) user.addresses[addrIndex].street = street;
    if (city !== undefined) user.addresses[addrIndex].city = city;
    if (state !== undefined) user.addresses[addrIndex].state = state;
    if (pinCode !== undefined) user.addresses[addrIndex].pinCode = pinCode;
    if (formattedAddress !== undefined) user.addresses[addrIndex].formattedAddress = formattedAddress.trim();
    if (lat !== undefined) user.addresses[addrIndex].lat = Number(lat) || 0;
    if (lng !== undefined) user.addresses[addrIndex].lng = Number(lng) || 0;
    if (label !== undefined) user.addresses[addrIndex].label = label;
    if (isPrimary !== undefined) user.addresses[addrIndex].isPrimary = Boolean(isPrimary);

    // Make sure at least one is primary
    const hasPrimary = user.addresses.some((a) => a.isPrimary);
    if (!hasPrimary && user.addresses.length > 0) {
      user.addresses[0].isPrimary = true;
    }

    const primaryAddr = user.addresses.find((a) => a.isPrimary);
    if (primaryAddr) {
      user.address = primaryAddr.formattedAddress;
    }

    await user.save();

    return res.status(200).json({
      status: "Success",
      msg: "Address updated successfully.",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Delete an address by ID
router.delete("/delete-address/:addressId", authenticateToken, async (req, res) => {
  try {
    const id = req.headers.id || req.headers.userid;
    const { addressId } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    const targetAddr = user.addresses.find((a) => a._id.toString() === addressId);
    const wasPrimary = targetAddr?.isPrimary;

    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);

    // If deleted address was primary, promote first remaining address to primary
    if (wasPrimary && user.addresses.length > 0) {
      user.addresses[0].isPrimary = true;
    }

    const primaryAddr = user.addresses.find((a) => a.isPrimary);
    user.address = primaryAddr ? primaryAddr.formattedAddress : "";

    await user.save();

    return res.status(200).json({
      status: "Success",
      msg: "Address removed.",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Set address as primary
router.put("/set-primary-address/:addressId", authenticateToken, async (req, res) => {
  try {
    const id = req.headers.id || req.headers.userid;
    const { addressId } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    let found = false;
    user.addresses.forEach((addr) => {
      if (addr._id.toString() === addressId) {
        addr.isPrimary = true;
        user.address = addr.formattedAddress;
        found = true;
      } else {
        addr.isPrimary = false;
      }
    });

    if (!found) {
      return res.status(404).json({ msg: "Address not found." });
    }

    await user.save();

    return res.status(200).json({
      status: "Success",
      msg: "Primary address set.",
      data: user.addresses,
    });
  } catch (error) {
    console.error("Error setting primary address:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Update address (legacy string update)
router.put("/update-address", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { address } = req.body;
    await User.findByIdAndUpdate(id, { address: address });
    res.status(200).json({ msg: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Update profile photo / avatar
router.put("/update-avatar", authenticateToken, async (req, res) => {
  try {
    const id = req.headers.id || req.headers.userid;
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ msg: "Avatar image data or URL is required." });
    }
    const updated = await User.findByIdAndUpdate(
      id,
      { avatar: avatar },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      status: "Success",
      msg: "Profile photo updated successfully.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Update full profile (avatar, bio, address, favoriteGenres, privacy)
router.put("/update-profile", authenticateToken, async (req, res) => {
  try {
    const id = req.headers.id || req.headers.userid;
    const { avatar, address, bio, favoriteGenres, readingGoal, privacy } = req.body;
    const updateData = {};
    if (avatar !== undefined) updateData.avatar = avatar;
    if (address !== undefined) updateData.address = address;
    if (bio !== undefined) updateData.bio = bio;
    if (favoriteGenres !== undefined) updateData.favoriteGenres = favoriteGenres;
    if (readingGoal !== undefined) updateData.readingGoal = readingGoal;
    if (privacy !== undefined) updateData.privacy = privacy;

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    return res.status(200).json({
      status: "Success",
      msg: "Profile updated successfully.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Update Library Privacy (Public / Private)
router.put("/update-privacy", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.headers.id || req.headers.userid;
    const { isPublic } = req.body;

    const updated = await User.findByIdAndUpdate(
      currentUserId,
      { "privacy.isPublic": Boolean(isPublic) },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      status: "Success",
      msg: `Library visibility set to ${Boolean(isPublic) ? "Public" : "Private"}`,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating privacy:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Search fellow users: By default show users with common book interest (shared library / favourites), or search by username query
router.get("/search-users", async (req, res) => {
  try {
    const query = req.query.query || req.query.q || "";
    const currentUserId = req.headers.id || req.headers.userid;

    // 1. Fetch current user's library and favourites to determine shared book interests
    let myBookIds = [];
    if (currentUserId) {
      const [myUserBooks, myUserDoc] = await Promise.all([
        UserBook.find({ user: currentUserId }).select("book").lean(),
        User.findById(currentUserId).select("favourites").lean(),
      ]);

      const bookIdSet = new Set([
        ...myUserBooks.map((ub) => ub.book?.toString()).filter(Boolean),
        ...(myUserDoc?.favourites || []).map((f) => f?.toString()).filter(Boolean),
      ]);
      myBookIds = Array.from(bookIdSet);
    }

    // Map other users to their shared book titles/counts
    const userSharedBooksMap = new Map(); // userId -> { titles: Set<string> }

    if (myBookIds.length > 0 && currentUserId) {
      const [sharedUserBooks, sharedFavUsers] = await Promise.all([
        UserBook.find({
          book: { $in: myBookIds },
          user: { $ne: currentUserId },
        })
          .populate("book", "title")
          .lean(),
        User.find({
          _id: { $ne: currentUserId },
          favourites: { $in: myBookIds },
        })
          .populate("favourites", "title")
          .select("favourites")
          .lean(),
      ]);

      sharedUserBooks.forEach((ub) => {
        const uid = ub.user.toString();
        if (!userSharedBooksMap.has(uid)) {
          userSharedBooksMap.set(uid, { titles: new Set() });
        }
        if (ub.book?.title) {
          userSharedBooksMap.get(uid).titles.add(ub.book.title);
        }
      });

      sharedFavUsers.forEach((u) => {
        const uid = u._id.toString();
        if (!userSharedBooksMap.has(uid)) {
          userSharedBooksMap.set(uid, { titles: new Set() });
        }
        (u.favourites || []).forEach((b) => {
          if (b?._id && myBookIds.includes(b._id.toString()) && b.title) {
            userSharedBooksMap.get(uid).titles.add(b.title);
          }
        });
      });
    }

    let users = [];
    const isSearchMode = Boolean(query.trim());

    if (isSearchMode) {
      // Search mode: Filter by username matching query
      let filter = {};
      const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.username = { $regex: escapedQuery, $options: "i" };

      if (currentUserId) {
        filter._id = { $ne: currentUserId };
      }

      users = await User.find(filter)
        .select("username avatar bio role privacy followers following readingGoal favoriteGenres createdAt")
        .limit(50)
        .lean();
    } else {
      // Default mode: ONLY show users who have common book interests with current user
      const commonUserIds = Array.from(userSharedBooksMap.keys());

      if (commonUserIds.length > 0) {
        users = await User.find({ _id: { $in: commonUserIds } })
          .select("username avatar bio role privacy followers following readingGoal favoriteGenres createdAt")
          .lean();
      } else {
        // No common books or user not logged in / has no books
        users = [];
      }
    }

    // Format users with common books information and following status
    let formatted = users.map((u) => {
      const isFollowing = currentUserId
        ? (u.followers || []).some((f) => f.toString() === currentUserId.toString())
        : false;

      const sharedInfo = userSharedBooksMap.get(u._id.toString());
      const sharedTitles = sharedInfo ? Array.from(sharedInfo.titles) : [];

      return {
        _id: u._id,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        role: u.role,
        isLibraryPublic: u.privacy?.isPublic !== false,
        followersCount: (u.followers || []).length,
        followingCount: (u.following || []).length,
        isFollowing,
        commonBooksCount: sharedTitles.length,
        commonBooks: sharedTitles.slice(0, 3),
      };
    });

    // If in default common-interest mode, sort users by most common books descending
    if (!isSearchMode) {
      formatted.sort((a, b) => b.commonBooksCount - a.commonBooksCount);
    }

    return res.status(200).json({
      status: "Success",
      data: formatted,
      isSearchMode,
      totalMatches: formatted.length,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Follow a user
router.put("/follow/:targetId", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.headers.id || req.headers.userid;
    const { targetId } = req.params;

    if (currentUserId.toString() === targetId.toString()) {
      return res.status(400).json({ msg: "You cannot follow yourself." });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found." });
    }

    // Add targetId to current user's following list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetId },
    });

    // Add currentUserId to target user's followers list
    const updatedTarget = await User.findByIdAndUpdate(
      targetId,
      { $addToSet: { followers: currentUserId } },
      { new: true }
    );

    return res.status(200).json({
      status: "Success",
      msg: `You are now following ${targetUser.username}`,
      isFollowing: true,
      followersCount: (updatedTarget.followers || []).length,
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Unfollow a user
router.put("/unfollow/:targetId", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.headers.id || req.headers.userid;
    const { targetId } = req.params;

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found." });
    }

    // Remove targetId from current user's following list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetId },
    });

    // Remove currentUserId from target user's followers list
    const updatedTarget = await User.findByIdAndUpdate(
      targetId,
      { $pull: { followers: currentUserId } },
      { new: true }
    );

    return res.status(200).json({
      status: "Success",
      msg: `Unfollowed ${targetUser.username}`,
      isFollowing: false,
      followersCount: (updatedTarget.followers || []).length,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Public User Profile & Library View
router.get("/user-profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.headers.id || req.headers.userid;

    const userDoc = await User.findOne({ username }).select("-password").lean();
    if (!userDoc) {
      return res.status(404).json({ msg: "User not found." });
    }

    const isLibraryPublic = userDoc.privacy?.isPublic !== false;
    const isOwner = currentUserId && currentUserId.toString() === userDoc._id.toString();
    const isFollowing = currentUserId
      ? (userDoc.followers || []).some((f) => f.toString() === currentUserId.toString())
      : false;

    let libraryData = null;
    if (isLibraryPublic || isOwner) {
      const entries = await UserBook.find({ user: userDoc._id }).populate("book").lean();
      libraryData = {
        WANT_TO_READ: entries.filter((e) => e.status === "WANT_TO_READ"),
        CURRENTLY_READING: entries.filter((e) => e.status === "CURRENTLY_READING"),
        FINISHED: entries.filter((e) => e.status === "FINISHED"),
        totalBooks: entries.length,
      };
    }

    return res.status(200).json({
      status: "Success",
      data: {
        _id: userDoc._id,
        username: userDoc.username,
        avatar: userDoc.avatar,
        bio: userDoc.bio,
        role: userDoc.role,
        favoriteGenres: userDoc.favoriteGenres || [],
        readingGoal: userDoc.readingGoal || { year: 2026, targetBooks: 12 },
        followersCount: (userDoc.followers || []).length,
        followingCount: (userDoc.following || []).length,
        isLibraryPublic,
        isFollowing,
        isOwner,
        library: libraryData,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// Get all users (Admin only)
router.get("/get-all-users", authenticateToken, async (req, res) => {
  try {
    const adminId = req.headers.id || req.headers.userid;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin rights required." });
    }
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ status: "Success", data: users });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
