const mongoose = require("mongoose")

module.exports = mongoose.model("contactUs", new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}))