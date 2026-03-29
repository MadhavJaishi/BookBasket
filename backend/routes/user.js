import express from "express";
const router = express.Router();
import User from "../models/user.js";
import { string } from "zod";
import bcrypt from "bcryptjs";
const { hash, compare } = bcrypt;
import jwt from "jsonwebtoken";
import { authenticateToken } from "./userAuth.js";
const nameSchema = string().min(5).max(14);
const passSchema = string()
  .min(4, { message: "Password must be at least 4 characters long." })
  .max(12, { message: "Password must not exceed 12 characters." });
const emailSchema = string().email();

//Signup
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    if (
      !nameSchema.safeParse(username).success ||
      !passSchema.safeParse(password).success ||
      !emailSchema.safeParse(email).success
    ) {
      res.status(400).json({ msg: "Invalid input credentials" });
      return;
    }
    const userExists = await User.findOne({ username: username });
    if (userExists) {
      res.status(411).json({ msg: "Username already exists" });
      return;
    }
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      res.status(411).json({ msg: "Email already used" });
      return;
    }
    const hashPass = await hash(password, 10);
    const newUser = new User({
      username: username,
      email: email,
      password: hashPass,
      address: address,
    });
    await newUser.save();
    res.status(200).json({ msg: "Signup successful." });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//Signin
router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDetails = await User.findOne({ username: username });
    if (!userDetails) {
      res.status(400).json({ msg: "User doesn't exist" });
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
    // select("-password") - this excludes password to be brought from db
    const data = await User.findById(id).select("-password");
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//Update address - for updating we use put request
router.put("/update-address", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { address } = req.body;
    await findByIdAndUpdate(id, { address: address });
    res.status(200).json({ msg: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
