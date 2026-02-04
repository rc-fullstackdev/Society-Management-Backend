const asyncHandler = require("express-async-handler")
const GuestInformation = require("../models/security-guard/GuestInformation");
const Residential = require("../models/auth/Residential");
const visitorTemplate = require("../utils/visitorTemplate");
const Secretary = require("../models/auth/Secretary");
const { sendEmail } = require("../utils/email");
const SecurityGuard = require("../models/auth/SecurityGuard");

exports.guestInformation = asyncHandler(async (req, res) => {
    const { guestName, mobileNumber, residentId, vehicleNumber, inTime, outTime } = req.body;

    const resident = await Residential.findById(residentId);

    if (!resident) return res.status(404).json({ message: "Resident not found" });

    const guard = await SecurityGuard.findById(req.securityGuard)

    await GuestInformation.create({
        guestName,
        mobileNumber: Number(mobileNumber),
        secretaryId: guard.secretaryId,
        residentId,
        guardId: req.securityGuard,
        vehicleNumber,
        inTime: new Date(),
        outTime: outTime || null
    });

    res.status(201).json({ message: "Guest Information Added Successfully" });
});

exports.GetAllResidential = asyncHandler(async (req, res) => {
    const guard = req.securityGuard;

    const result = await Residential.find({
        secretaryId: guard.secretaryId
    });

    res.json({
        message: "Get All Residential Successfully",
        result
    });
});

exports.getAllGuest = asyncHandler(async (req, res) => {

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { start, limit } = req.query

    const filter = {
        guardId: req.securityGuard,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    };

    const total = await GuestInformation.countDocuments(filter)

    const result = await GuestInformation.find(filter)
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(limit)
        .populate("residentId", "name mobile flatNumber floor wing residentialProfile")

    res.json({ message: "Guest Information Fetched Successfully", result, total })
})

exports.markGuestOutTime = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const guest = await GuestInformation.findById(id);

    if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
    }

    if (guest.outTime) {
        return res.status(400).json({ message: "Out time already marked" });
    }

    guest.outTime = new Date();
    await guest.save();

    const resident = await Residential.findById(guest.residentId);
    if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
    }

    const secretary = await Secretary.findById(resident.secretaryId);
    if (!secretary) {
        return res.status(404).json({ message: "Secretary not found" });
    }

    const formatOnlyTime = (date) =>
        new Date(date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        });

    const html = visitorTemplate({
        societyName: secretary.societyName,
        secretaryName: secretary.secretaryName,
        residentName: resident.name,
        guestName: guest.guestName,
        flatNumber: resident.flatNumber,
        floor: resident.floor,
        wing: resident.wing,
        vehicleNumber: guest.vehicleNumber,
        inTime: formatOnlyTime(guest.inTime),
        outTime: formatOnlyTime(guest.outTime)
    });

    await sendEmail({
        to: resident.email,
        subject: "Visitor Exit Notification",
        message: html
    });

    res.status(200).json({
        message: "Guest out time marked successfully",
        outTime: guest.outTime
    });
});
