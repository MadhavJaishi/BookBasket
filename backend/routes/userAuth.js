import jwt from "jsonwebtoken";
import user from "../models/user.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    res.status(401).json({ msg: "Unauthorized client error" });
    return;
  }
  jwt.verify(token, "BookBasket", (err, data) => {
    if (err) {
      res.status(401).json({ msg: "Token expired, please signin again!" });
      return;
    }
    req.user = data;
    next();
  });
};
