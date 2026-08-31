import express from "express";
const router = express.Router();
import { authenticateToken } from "./userAuth.js";
import User from "../models/user.js";
import Book from "../models/book.js";

//add book -- admin
router.post("/add-book", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await User.findById(id);
    if (user.role != "admin") {
      return res.status(500).json({ msg: "Access declined for normal users." });
    }
    const { url, title, author, price, genre, desc, language } = req.body;
    const book = new Book({
      url: url,
      title: title,
      author: author,
      price: price,
      genre: genre,
      desc: desc,
      language: language
    });
    await book.save();
    res.status(200).json({ msg: "Book added successfully." });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//update book -- admim
router.put("/update-book", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.headers;
    const { url, title, author, price, genre, desc, language } = req.body;
    const user = await Book.findByIdAndUpdate(bookid, {
      url: url,
      title: title,
      author: author,
      price: price,
      genre: genre,
      desc: desc,
      language: language,
    });
    res.status(200).json({ msg: "Book updated successfully." });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//delete book -- admin
router.delete("/delete-book", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.headers;
    await Book.findByIdAndDelete(bookid);
    res.status(200).json({ msg: "Book deleted successfully." });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//get all books
router.get("/get-all-books", async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 });
    return res.json({
      status: "Success",
      data: books,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//get recent books limit of 4 to show on homepage
router.get("/get-recent-books", async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 }).limit(4);
    return res.json({
      status: "Success",
      data: books,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

//get details of a particular book
router.get("/get-book-details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({ _id: id });
    return res.json({
      status: "Success",
      data: book,
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// bulk import books -- admin
router.post("/bulk-import", authenticateToken, async (req, res) => {
  try {
    const userid = req.headers.id || req.headers.userid;
    const user = await User.findById(userid);
    if (!user || user.role !== "admin") {
      return res.status(401).json({ msg: "Access declined for normal users." });
    }

    let booksData = req.body;
    if (!Array.isArray(booksData) && Array.isArray(req.body.books)) {
      booksData = req.body.books;
    }

    if (!Array.isArray(booksData)) {
      return res.status(400).json({ msg: "Invalid format. Expected an array of book objects." });
    }

    if (booksData.length === 0) {
      return res.status(400).json({ msg: "Empty list. Please provide at least one book object." });
    }

    const summary = {
      total: booksData.length,
      imported: 0,
      skipped: 0,
      failed: 0,
      details: {
        imported: [],
        skipped: [],
        failed: [],
      },
    };

    const newBooksToInsert = [];

    for (let i = 0; i < booksData.length; i++) {
      const item = booksData[i];
      const index = i + 1;

      const title = item.title ? String(item.title).trim() : "";
      const author = item.author ? String(item.author).trim() : "";
      const price = item.price !== undefined ? Number(item.price) : NaN;
      const desc = item.desc || item.description ? String(item.desc || item.description).trim() : "";
      const genre = item.genre || item.category ? String(item.genre || item.category).trim() : "";
      const url = item.url || item.coverImage ? String(item.url || item.coverImage).trim() : "";
      const language = item.language ? String(item.language).trim() : "English";
      const isbn = item.isbn ? String(item.isbn).trim() : "";

      if (!title || !author || isNaN(price) || price < 0 || !desc || !genre || !url) {
        const missing = [];
        if (!title) missing.push("title");
        if (!author) missing.push("author");
        if (isNaN(price) || price < 0) missing.push("price");
        if (!desc) missing.push("description/desc");
        if (!genre) missing.push("category/genre");
        if (!url) missing.push("coverImage/url");

        summary.failed++;
        summary.details.failed.push({
          index,
          title: title || "Unknown Title",
          reason: `Missing or invalid field(s): ${missing.join(", ")}`,
        });
        continue;
      }

      let isDuplicate = false;
      let duplicateReason = "";

      if (isbn) {
        const existingIsbn = await Book.findOne({ isbn: isbn });
        if (existingIsbn) {
          isDuplicate = true;
          duplicateReason = `Book with ISBN '${isbn}' already exists.`;
        }
      }

      if (!isDuplicate) {
        const existingTitleAuthor = await Book.findOne({
          title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
          author: { $regex: new RegExp(`^${author.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        });
        if (existingTitleAuthor) {
          isDuplicate = true;
          duplicateReason = `Book with title '${title}' by '${author}' already exists.`;
        }
      }

      if (!isDuplicate) {
        const batchDuplicate = newBooksToInsert.find((b) => {
          if (isbn && b.isbn && b.isbn === isbn) return true;
          return (
            b.title.toLowerCase() === title.toLowerCase() &&
            b.author.toLowerCase() === author.toLowerCase()
          );
        });
        if (batchDuplicate) {
          isDuplicate = true;
          duplicateReason = `Duplicate item within current import batch.`;
        }
      }

      if (isDuplicate) {
        summary.skipped++;
        summary.details.skipped.push({
          index,
          title,
          author,
          isbn,
          reason: duplicateReason,
        });
      } else {
        newBooksToInsert.push({
          url,
          title,
          author,
          price,
          genre,
          desc,
          language,
          isbn,
        });
      }
    }

    if (newBooksToInsert.length > 0) {
      const insertedBooks = await Book.insertMany(newBooksToInsert);
      summary.imported = insertedBooks.length;
      summary.details.imported = insertedBooks.map((b) => ({
        id: b._id,
        title: b.title,
        author: b.author,
      }));
    }

    return res.status(200).json({
      status: "Success",
      msg: `Import completed: ${summary.imported} imported, ${summary.skipped} skipped, ${summary.failed} failed.`,
      summary,
    });
  } catch (error) {
    console.error("Error during bulk import:", error);
    return res.status(500).json({ msg: "Internal server error during bulk import." });
  }
});

export default router;
