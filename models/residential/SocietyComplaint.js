const mongoose = require("mongoose");

module.exports = mongoose.model("SocietyComplaint", new mongoose.Schema({
    secretaryId: { type: mongoose.Types.ObjectId, ref: "secretary" },
    residentId: { type: mongoose.Types.ObjectId, ref: "residential", required: true },
    category: {
        type: String,
        enum: [
            "Water",
            "Electricity",
            "Plumbing",
            "Lift",
            "Parking",
            "Security",
            "Noise in Society",
            "Common Area Maintenance",
            "CCTV / Surveillance",
        ],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    complaintImages: { type: [String] },
    workingImages: { type: [String], default: [] },
    status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" },
    createdAt: { type: Date, default: Date.now },
}));


