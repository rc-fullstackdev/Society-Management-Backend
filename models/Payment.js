const mongoose = require("mongoose");

module.exports = mongoose.model("payment", new mongoose.Schema({
    secretaryId: { type: mongoose.Types.ObjectId, ref: "secretary", required: true },
    maintenanceId: { type: mongoose.Types.ObjectId, ref: "maintenance", required: true },
    residentId: { type: mongoose.Types.ObjectId, ref: "residential", required: true, index: true },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    method: { type: String, enum: ["Cash", "UPI", "Card", "Online"], default: "Cash" },
    status: { type: String, enum: ["Paid", "Pending"], default: "Paid" }
}));
