const mongoose = require("mongoose")

module.exports = mongoose.model("bill", new mongoose.Schema({
    secretaryId: {
        type: mongoose.Types.ObjectId,
        ref: "secretary",
        required: true
    },
    residentId: {
        type: mongoose.Types.ObjectId,
        ref: "residential",
        required: true
    },
    bookingId: {
        type: mongoose.Types.ObjectId,
        ref: "facilityBooking",
        required: true,
        unique: true
    },
    billNumber: {
        type: String,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    billType: {
        type: String,
        default: "facility"
    },
    status: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid"
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
}))
