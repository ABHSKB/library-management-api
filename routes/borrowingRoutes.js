const express = require("express");
const authenticate = require("../middleware/authenticate");
const { borrowings, borrowingHistory, getBorrowingById, returnBook, allBorrowingHistoryController } = require("../controllers/borrowingController");
const authorize = require("../middleware/authorize");

const borrowingRouter = express.Router();
const list = ["librarian", "admin"];

borrowingRouter.post("/",authenticate, borrowings);
borrowingRouter.get("/me",authenticate, borrowingHistory);
borrowingRouter.get("/:id",authenticate, getBorrowingById);
borrowingRouter.get("/",authenticate, authorize(list), allBorrowingHistoryController);
borrowingRouter.patch("/:id/return", authenticate, returnBook);

module.exports = borrowingRouter;
