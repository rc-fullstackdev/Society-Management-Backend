const mongoose = require("mongoose");

module.exports = mongoose.model("maintenance", new mongoose.Schema({
    secretaryId: { type: mongoose.Types.ObjectId, ref: "secretary" },
    month: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
}));
