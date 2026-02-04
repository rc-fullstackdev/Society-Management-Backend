const mongoose = require("mongoose")

module.exports = mongoose.model("facilityBooking", new mongoose.Schema({
    secretaryId: { type: mongoose.Types.ObjectId, ref: "secretary", required: true },
    residentId: { type: mongoose.Types.ObjectId, ref: "residential", required: true },
    facilityType: { type: String, enum: ["garden", "club", "swimming_pool", "gym"], required: true },
    bookingDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    bookingAmount: Number,
    rejectReason: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "unpaid"],
        default: "unpaid"
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "cancelled"],
        default: "pending"
    },
    billGenerated: {
        type: Boolean,
        default: false
    },
    createdAt: { type: Date, default: Date.now },
}))