const express = require("express");
const authenticate = require("../middleware/authenticate");
const { getAllBooksController, getBookByIdController, createBookController, updateBookController, deleteBookController } = require("../controllers/bookController");
const authorize = require("../middleware/authorize");

const bookRouter = express.Router();
const list = ["librarian", "admin"];

bookRouter.get("/", authenticate, getAllBooksController);
bookRouter.get("/:id", authenticate, getBookByIdController);
bookRouter.post("/", authenticate, authorize(list),createBookController);
bookRouter.put("/:id", authenticate, authorize(list),updateBookController);
bookRouter.delete("/:id", authenticate, authorize(list),deleteBookController);

module.exports = bookRouter;
