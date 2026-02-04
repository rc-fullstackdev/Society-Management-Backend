const asyncHandler = require("express-async-handler")
const Secretary = require("../models/auth/Secretary")
const ContactUs = require("../models/admin/ContactUs")


exports.societyDetails = asyncHandler(async (req, res) => {
    const { limit, start } = req.query
    const total = await Secretary.countDocuments()
    const result = await Secretary.find().select("-password -createdAt -__v").skip(start).limit(limit)
    res.json({ message: "Fetch All Details Successfully", result, total })
})

exports.updateSecretaryAccess = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await Secretary.findById(id);

    if (!result) {
        return res.status(404).json({ message: "Secretary not found" });
    }

    result.isActive = isActive;
    await result.save();

    res.json({
        message: `Secretary ${isActive ? "enabled" : "disabled"} successfully`,
        result
    });
});

exports.contactUs = asyncHandler(async (req, res) => {
    const { name, email, mobile, message } = req.body
    await ContactUs.create({ name, email, mobile, message })
    res.status(201).json({ message: "Message Send Successfully" })
})

exports.contactUsDetails = asyncHandler(async (req, res) => {
    const { limit, start } = req.query
    const total = await ContactUs.countDocuments()
    const result = await ContactUs.find().sort({ createdAt: -1 }).skip(start).limit(limit)
    res.json({ message: "Fetch All Details Successfully", result, total })
})