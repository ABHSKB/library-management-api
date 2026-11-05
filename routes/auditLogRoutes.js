const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { getAllAuditLogsController, getUserAuditLogsController } = require("../controllers/auditLogController");

const auditRouter = express.Router();
const list = ["admin"];

auditRouter.get("/",authenticate, authorize(list), getAllAuditLogsController);
auditRouter.get("/user/:id",authenticate, authorize(list), getUserAuditLogsController);

module.exports = auditRouter;