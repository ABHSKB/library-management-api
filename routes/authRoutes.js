const express = require("express");
const { registration, login, getMe } = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");

const authRouter = express.Router();

authRouter.post("/register",registration);
authRouter.post("/login", login);
authRouter.get("/me",authenticate,getMe);

module.exports = authRouter;