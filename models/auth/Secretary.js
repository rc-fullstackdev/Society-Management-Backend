const mongoose = require("mongoose");

module.exports = mongoose.model("secretary", new mongoose.Schema({
    societyName: { type: String, required: true },
    societyAddress: { type: String, required: true },
    societyImage: { type: [String], required: true },
    secretaryName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    secretaryProfile: {
        type: String,
        default: "https://res.cloudinary.com/doql9dzlp/image/upload/v1763623977/default-man_vkxpj8.png",
        required: true
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
}));
