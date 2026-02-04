const mongoose = require("mongoose")

module.exports = mongoose.model("securityGuard", new mongoose.Schema({
    secretaryId: { type: mongoose.Types.ObjectId, ref: "secretary" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    securityGuardProfile: {
        type: String,
        default: "https://res.cloudinary.com/doql9dzlp/image/upload/v1763623977/default-man_vkxpj8.png",
        required: true
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
}))