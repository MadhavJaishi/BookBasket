const jwt = require("jsonwebtoken")
const user = require("../models/user")

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
    if (token == null) {
        res.status(401).json({msg: "Unauthorized client error"})
        return;
    }
    jwt.verify(token, "ReadingRoom", (err, data) => {
        if (err) {
            res.status(401).json({msg: "Token expired, please signin again!"})
            return;
        }
        req.user = user;
        next();
    })
}

module.exports = { authenticateToken } 