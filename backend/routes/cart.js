const router = require("express").Router()
const { authenticateToken } = require("./userAuth")
const User = require("../models/user")

// add book to cart
router.put("/add-book-to-cart", authenticateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers; //id is userid
        const userData = await User.findById(id);
        const isBookInCart = userData.cart.includes(bookid);
        if (isBookInCart) {
            return res.status(200).json({
                status: "Success",
                msg: "Book is already in cart."
            })
        }
        await User.findByIdAndUpdate(id, {$push: { cart: bookid }})
        return res.status(200).json({msg: "Book added to cart."})
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

// remove book from cart
router.put("/remove-book-from-cart/:bookid", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.params; //id is userid
        const { id } = req.headers;
        await User.findByIdAndUpdate(id, {$pull: {cart: bookid}})
        return res.status(200).json({
            status: "Success",
            msg: "Book removed from cart."
        })
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

// get cart of a particular user
router.get("/get-user-cart", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const data = await User.findById(id).populate("cart");
        return res.status(200).json({
            status: "Success",
            data: data.cart.reverse(),
        })
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

module.exports = router
