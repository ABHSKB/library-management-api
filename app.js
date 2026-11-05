const express = require("express");
require("dotenv").config();

const authRouter = require("./routes/authRoutes");
const bookRouter = require("./routes/bookRoutes");
const auditRouter = require("./routes/auditLogRoutes");
const borrowingRouter = require("./routes/borrowingRoutes");
const settingRouter = require("./routes/settingsRoutes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/books", bookRouter);

app.use("/api/borrowings", borrowingRouter);

app.use("/api/audit-logs", auditRouter);

app.use("/api/settings", settingRouter);

app.use((req, res) => {
    return res.status(404).json({
        message: "Route not found"
    });
});

module.exports=app;