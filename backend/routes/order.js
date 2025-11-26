const router = require("express").Router()
const { authenticateToken } = require("./userAuth")
const Book = require("../models/book")
const Order = require("../models/order")
const User = require("../models/user")

// place order of user
router.post("/place-order", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { order } = req.body;
        for (const orderData of order) {
            const newOrder = new Order({
                user: id,
                book: orderData._id,
            })
            const orderedDataFromDB = await newOrder.save()
            //saving order in user
            await User.findByIdAndUpdate(id, {$push: {orders: orderedDataFromDB._id}})
            //removing books from cart
            await User.findByIdAndUpdate(id, {$pull: {cart: orderData._id}})
        }
        return res.status(200).json({
            status: "Success",
            msg: "Order placed successfully",
        })
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

// get user's order history
router.get("/get-order-history", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const orderData = await User.findById(id).populate({
            path: "orders",
            populate: {path: "book"}
        })
        return res.status(200).json({
            status: "Success",
            data: orderData.orders.reverse(),
        })
        
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

// get all orders placed in our webapp
router.get("/get-all-orders", authenticateToken, async (req, res) => {
    try {
        const orderData = await Order.find().populate({
            path: "book",
        }).populate({
            path: "user"
        }).sort({ createdAt: -1 })
        return res.status(200).json({
            status: "Success",
            data: orderData,
        })
    }
    catch(error) {
        res.status(500).json({msg: "Internal server error"})
    }
})

// update order status by admin
router.put("/update-status/:id", authenticateToken, async (req, res) => {
    const { userid } = req.headers;
    const { id } = req.params;
    const user = await User.findById(userid);
    if (user.role != "admin") return res.status(401).json({msg: "Unauthorized access!!"});
    await Order.findByIdAndUpdate(id, { status: req.body.status })
    return res.status(200).json({
        status: "Success",
        msg: "Status updated successfully."
    })
})

module.exports = router;