const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { getLibrarySettingsController, updateLibrarySettingsController } = require("../controllers/settingsController");

const settingRouter = express.Router();
const list = ["admin"];

settingRouter.get("/",authenticate, authorize(list), getLibrarySettingsController);
settingRouter.put("/", authenticate, authorize(list), updateLibrarySettingsController);

module.exports = settingRouter;