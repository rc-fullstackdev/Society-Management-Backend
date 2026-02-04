const mongoose = require("mongoose");

module.exports = mongoose.model("event", new mongoose.Schema({
    secretaryId: { type: mongoose.Types.ObjectId, ref: "secretary", required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
}));
