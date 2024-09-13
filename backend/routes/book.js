const router = require("express").Router()
const { authenticateToken } = require("./userAuth")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const Book = require("../models/book")

//add book -- admin
router.post("/add-book", authenticateToken, async (req, res) => {
    try {
        const {id} = req.headers;
        const user = await User.findById(id);
        if (user.role != "admin") {
            return res.status(500).json({msg: "Access declined for normal users."})
        }
        const {url, title, author, price, genre, desc, language} = req.body;
        const book = new Book({
            url: url,
            title: title,
            author: author,
            price: price,
            genre: genre,
            desc: desc,
            language: language
        })
        await book.save();
        res.status(200).json({msg: "Book added successfully."})
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

//update book -- admim
router.put("/update-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;
        const {url, title, author, price, genre, desc, language} = req.body;
        const user = await Book.findByIdAndUpdate(bookid, {
            url: url,
            title: title,
            author: author,
            price: price,
            genre: genre,
            desc: desc,
            language: language
        });
        res.status(200).json({msg: "Book updated successfully."})
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

//delete book -- admin
router.delete("/delete-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;
        await Book.findByIdAndDelete(bookid);
        res.status(200).json({msg: "Book deleted successfully."})
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

//get all books
router.get("/get-all-books", async (req, res) => {
    try {
        const books = await Book.find({}).sort({ createdAt: -1 });
        return res.json({
            status: "Success",
            data: books,
        });
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

//get recent books limit of 4 to show on homepage
router.get("/get-recent-books", async (req, res) => {
    try {
        const books = await Book.find({}).sort({ createdAt: -1 }).limit(4);
        return res.json({
            status: "Success",
            data: books,
        });
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

//get details of a particular book
router.get("/get-book-details/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findOne({_id: id});
        return res.json({
            status: "Success",
            data: book,
        });
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

module.exports = router