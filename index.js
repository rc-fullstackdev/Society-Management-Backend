const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const app = express()

app.use(express.json())
// app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(cors({ origin: "https://society-management-frontend-one.vercel.app", credentials: true }))
app.use(cookieParser())

app.use("/api/auth", require("./routes/auth.route"))
app.use("/api/admin", require("./routes/admin.route"))
app.use("/api/secretary", require("./routes/secretary.route"))
app.use("/api/residential", require("./routes/residential.route"))
app.use("/api/securityGuard", require("./routes/securityGuard.route"))

app.use("*", (req, res) => {
    res.json({ message: "Resource Not Found" })
})

app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);
    res.status(500).json({
        message: err.message || "Server Error",
    });
});

mongoose.connect(process.env.MONGO_URL)

mongoose.connection.once("open", () => {
    console.log("db Connected")
    app.listen(process.env.PORT, console.log("Server Running"))
})
