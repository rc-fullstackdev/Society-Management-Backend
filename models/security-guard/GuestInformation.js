const { request } = require("express");
const mongoose = require("mongoose");

module.exports = mongoose.model("guestInformation", new mongoose.Schema({
    guestName: { type: String, required: true },
    mobileNumber: { type: Number, required: true },

    secretaryId: { type: mongoose.Types.ObjectId, ref: "secretary", required: true },
    residentId: { type: mongoose.Types.ObjectId, ref: "residential", required: true },
    guardId: { type: mongoose.Types.ObjectId, ref: "securityGuard", required: true },
    vehicleNumber: { type: String },

    inTime: { type: String, required: true },
    outTime: { type: String },

    createdAt: { type: Date, default: Date.now }
}));
