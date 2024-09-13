const router = require("express").Router()
const User = require("../models/user")
const { authenticateToken } = require("./userAuth")

//add book to favourites
router.put("/add-book-to-favourites", authenticateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers; //id is userid
        const userData = await User.findById(id);
        const isFavourite = userData.favourites.includes(bookid);
        if (isFavourite) {
            return res.status(200).json({msg: "Book is already in favourites."})
        }
        await User.findByIdAndUpdate(id, {$push: { favourites: bookid }})
        return res.status(200).json({msg: "Book added to favourites."})
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

//remove book from favourites
router.put("/remove-book-from-favourites", authenticateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers; //id is userid
        const userData = await User.findById(id);
        const isFavourite = userData.favourites.includes(bookid);
        if (isFavourite) {
            await User.findByIdAndUpdate(id, {$pull: { favourites: bookid }})
        }
        return res.status(200).json({msg: "Book removed from favourites."})
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

//fetch favourites books
router.get("/get-all-favourites", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        // Since favourites references books, Without populate: You only get ObjectIds for related fields. With populate: You get the full related documents.
        const data = await User.findById(id).populate("favourites");
        return res.status(200).json({
            status: "Success",
            data: data.favourites, 
        });
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

module.exports = router