const asyncHandler = require("express-async-handler")
const Maintenance = require("../models/secretary/Maintenance")
const Payment = require("../models/Payment")
const Residential = require("../models/auth/Residential")
const { sendEmail } = require("../utils/email")
const maintenanceTemplate = require("../utils/maintenanceTemplate");
const Secretary = require("../models/auth/Secretary")
const Event = require("../models/secretary/Event")
const eventTemplate = require("../utils/eventTemplate")
const maintenanceReceipt = require("../utils/maintenanceReceipt")
const SecurityGuard = require("../models/auth/SecurityGuard")
const SocietyComplaint = require("../models/residential/SocietyComplaint")
const { societyWorkingComplaintImages, residentialImage } = require("../utils/upload")
const cloud = require("../utils/cloudinary")
const path = require("path")
const GuestInformation = require("../models/security-guard/GuestInformation")
const FacilityBooking = require("../models/residential/FacilityBooking")
const BookingTemplate = require("../utils/BookingTemplate")
const facilityInvoice = require("../utils/facilityInvoice")
const generatePdf = require("../utils/generatePdf")
const generateInvoiceNumber = require("../utils/generateSimpleInvoiceNumber")

exports.getAllResidents = asyncHandler(async (req, res) => {
    const result = await Residential.find({ secretaryId: req.secretary })
        .select("name mobile flatNumber floor wing residentialProfile isActive")
        .populate("secretaryId", "_id")
    res.json({ message: "Fetch All Residents Successfully", result })
})

exports.getSecurityGuard = asyncHandler(async (req, res) => {
    const result = await SecurityGuard.find({ secretaryId: req.secretary })
        .select("name email mobile securityGuardProfile isActive")
    res.json({ message: "Fetch Security Guard Successfully", result })
})

exports.updateUserAccess = asyncHandler(async (req, res) => {
    const { role, id } = req.params
    const { isActive } = req.body

    let Model

    if (role === "resident") {
        Model = Residential
    } else if (role === "guard") {
        Model = SecurityGuard
    } else {
        return res.status(400).json({ message: "invalid role" })
    }

    const user = await Model.findById(id)

    if (!user) {
        return res.status(404).json({ message: `${role} not found` })
    }

    user.isActive = isActive
    await user.save()

    res.json({
        message: `${role} ${isActive ? "enabled" : "disabled"} successfully`,
        user
    });
})

exports.createMaintenance = asyncHandler(async (req, res) => {
    const { month, amount, dueDate, description } = req.body;

    const existingMaintenance = await Maintenance.findOne({
        secretaryId: req.secretary,
        month
    });

    if (existingMaintenance) {
        return res.status(400).json({ message: "You have already created maintenance for this month" });
    }

    await Maintenance.create({
        secretaryId: req.secretary,
        month,
        amount,
        dueDate,
        description
    });

    const residents = await Residential.find({ secretaryId: req.secretary });

    const secretary = await Secretary.findById(req.secretary);

    for (const user of residents) {

        const html = maintenanceTemplate({
            societyName: secretary.societyName,
            secretaryName: secretary.secretaryName,
            name: user.name,
            month,
            amount,
            dueDate
        });

        await sendEmail({
            to: user.email,
            subject: "Maintenance Reminder",
            message: html
        });
    }

    res.status(201).json({ message: "Maintenance Created & Email Sent" });
});

exports.getAllMaintenance = asyncHandler(async (req, res) => {
    const { limit, start } = req.query
    const total = await Maintenance.countDocuments()
    const result = await Maintenance.find({ secretaryId: req.secretary }).sort({ month: -1 }).skip(start).limit(limit)
    res.json({ message: "Get All Maintenance History Successfully", result, total })
})

exports.getAllPaymentHistory = asyncHandler(async (req, res) => {
    const { limit, start } = req.query
    const total = await Payment.countDocuments()
    const result = await Payment.find({ secretaryId: req.secretary })
        .sort({ paymentDate: -1 })
        .skip(start)
        .limit(limit)
        .populate('maintenanceId', 'month')
    res.json({ message: "Get All Payment History Successfully", result, total })
})

exports.addCashMaintenanceBySecretary = asyncHandler(async (req, res) => {
    const { residentId, month, amountPaid, paymentDate, } = req.body;

    const secretary = req.secretary;
    const now = new Date();

    //  BASIC VALIDATION
    if (!residentId || !month || !amountPaid) {
        return res.status(400).json({
            message: "Resident, month and amount are required",
        });
    }

    //  MONTH HELPERS
    const formatMonth = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const currentMonth = formatMonth(now);
    const lastMonth = formatMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const nextMonth = formatMonth(new Date(now.getFullYear(), now.getMonth() + 1, 1));

    const selectedMonth = month.slice(0, 7); // YYYY-MM

    // MONTH VALIDATION
    if (![lastMonth, currentMonth, nextMonth].includes(selectedMonth)) {
        return res.status(400).json({
            message:
                selectedMonth > nextMonth
                    ? "You can only pay one month in advance"
                    : "You can only pay last unpaid or current month maintenance",
        });
    }

    //  FIND RESIDENT
    const resident = await Residential.findById(residentId);

    if (!resident) {
        return res.status(404).json({
            message: "Resident not found",
        });
    }

    //  SECURITY CHECK
    if (!resident.secretaryId?._id || resident.secretaryId._id.toString() !== secretary.toString()) {
        return res.status(403).json({
            message: "You are not authorized to add payment for this resident",
        });
    }

    //  FIND MAINTENANCE
    const maintenance = await Maintenance.findOne({
        month: selectedMonth,
        secretaryId: secretary,
    });

    if (!maintenance) {
        return res.status(404).json({
            message: "Maintenance not found for selected month",
        });
    }

    //  DUPLICATE PAYMENT CHECK
    const alreadyPaid = await Payment.findOne({
        residentId: resident._id,
        maintenanceId: maintenance._id,
        status: "Paid",
    });

    if (alreadyPaid) {
        return res.status(400).json({
            message: "Maintenance already paid for this month",
        });
    }


    //  AMOUNT VALIDATION
    if (Number(amountPaid) !== Number(maintenance.amount)) {
        return res.status(400).json({
            message: `Amount must be exactly ₹${maintenance.amount}`,
        });
    }

    const payment = await Payment.create({
        secretaryId: secretary,
        residentId: resident._id,
        maintenanceId: maintenance._id,
        amountPaid: maintenance.amount,
        paymentDate: paymentDate || new Date(),
        method: "Cash",
        status: "Paid",
        addedBy: "Secretary",
    });

    const html = maintenanceReceipt({
        societyName: secretary.societyName,
        secretaryName: secretary.secretaryName,
        residentName: resident.name,
        month: maintenance.month,
        amount: payment.amountPaid,
        method: "Cash",
        paymentDate: payment.paymentDate,
        receiptNumber: payment._id,
    });

    await sendEmail({
        to: resident.email,
        subject: "Maintenance Payment Receipt (Cash)",
        message: html,
    });

    res.status(201).json({
        message: "Cash maintenance payment added successfully",
        paymentId: payment._id,
        month: maintenance.month,
    });
});

exports.getResidentById = asyncHandler(async (req, res) => {
    const residentId = req.params.id
    const resident = await Residential.findById(residentId);

    if (!resident) {
        res.status(404);
        throw new Error('Resident not found');
    }

    res.status(200).json({
        message: 'Resident fetched successfully',
        result: resident
    });
})

exports.addEvent = asyncHandler(async (req, res) => {
    const { title, description, date } = req.body

    await Event.create({ secretaryId: req.secretary, title, description, date })

    const residents = await Residential.find({ secretaryId: req.secretary });

    const secretary = await Secretary.findById(req.secretary);

    for (const user of residents) {

        const html = eventTemplate({
            societyName: secretary.societyName,
            secretaryName: secretary.secretaryName,
            name: user.name,
            title,
            description,
            date
        });

        await sendEmail({
            to: user.email,
            subject: "UP Comming Event",
            message: html
        });
    }
    res.status(201).json({ message: "Add Event Successfully" })
})

exports.getAllEvents = asyncHandler(async (req, res) => {
    const { limit, start } = req.query
    const total = await Event.countDocuments()
    const result = await Event.find({ secretaryId: req.secretary }).sort({ date: -1 }).skip(start).limit(limit)
    res.json({ message: "Get All Event Successfully", result, total })
})

exports.getsocietyComplaint = asyncHandler(async (req, res) => {
    const { start, limit } = req.query
    const total = await SocietyComplaint.countDocuments()
    const result = await SocietyComplaint.find()
        .populate("residentId", "name mobile flatNumber floor wing residentialProfile")
        .skip(start)
        .limit(limit)

    res.json({ message: "Society Complaint Fetch Successfully", result, total })
})

exports.getComplaintById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await SocietyComplaint.findById(id)
        .populate("residentId");

    if (!result) {
        return res.status(404).json({
            message: "Complaint not found"
        });
    }

    res.json({
        message: "Complaint fetched successfully",
        result
    });
});

exports.updateSocietyComplaint = asyncHandler(async (req, res) => {

    societyWorkingComplaintImages(req, res, async (err) => {

        if (err) {
            return res.status(400).json({ message: "Multer error", error: err.message })
        }

        const { status } = req.body
        const workingImages = []

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const { secure_url } = await cloud.uploader.upload(file.path)
                workingImages.push(secure_url)
            }
        }

        const result = await SocietyComplaint.findByIdAndUpdate(
            req.params.id,
            {
                status,
                ...(workingImages.length > 0 && {
                    $push: { workingImages: { $each: workingImages } }
                })
            },
            { new: true }
        )

        if (!result) {
            return res.status(404).json({ message: "Complaint not found" })
        }

        res.json({
            message: "Complaint updated successfully",
            result
        })
    })
})

exports.updateResident = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const resident = await Residential.findById(id);
    if (!resident) {
        return res.status(400).json({ message: "Resident not found" });
    }

    if (
        !resident.secretaryId ||
        resident.secretaryId.toString() !== req.secretary.toString()
    ) {
        return res.status(403).json({
            message: "You are not authorized to update this resident",
        });
    }

    const ONE_HOUR = 1000 * 60 * 60;
    if (Date.now() - new Date(resident.createdAt) > ONE_HOUR) {
        return res.status(409).json({
            message: "Resident data can only be updated within 1 hour of registration",
        });
    }

    const updateData = {
        name: req.body.name,
        mobile: req.body.mobile,
    };

    const updatedResident = await Residential.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    res.json({
        message: "Residential Updated Successfully",
        result: updatedResident,
    });
});

exports.updateGuard = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const gaurd = await SecurityGuard.findById(id);

    if (!gaurd) {
        return res.status(400).json({ message: "Security gaurd not found" });
    }

    if (
        !gaurd.secretaryId ||
        gaurd.secretaryId.toString() !== req.secretary.toString()
    ) {
        return res.status(403).json({
            message: "You are not authorized to update this resident",
        });
    }

    const ONE_HOUR = 1000 * 60 * 60;
    if (Date.now() - new Date(gaurd.createdAt) > ONE_HOUR) {
        return res.status(409).json({
            message: "Security gaurd data can only be updated within 1 hour of registration",
        });
    }

    const updateData = {
        name: req.body.name,
        mobile: req.body.mobile,
    };

    const updatedGuard = await SecurityGuard.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    res.json({
        message: "Security guard Updated Successfully",
        result: updatedGuard,
    });
});

exports.getAllVisitedGuestsForSecretary = asyncHandler(async (req, res) => {

    const { start, limit } = req.query

    const total = await GuestInformation.countDocuments()

    const result = await GuestInformation.find({ secretaryId: req.secretary })
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(limit)
        .populate("residentId", "name mobile flatNumber floor wing residentialProfile")
        .populate("guardId", "name mobile securityGuardProfile");

    res.json({ message: "Guest Information Fetched Successfully", result, total })
})

exports.getFacilityBooking = asyncHandler(async (req, res) => {
    const { start, limit } = req.query

    const total = await FacilityBooking.countDocuments({ secretaryId: req.secretary })

    const result = await FacilityBooking.find({ secretaryId: req.secretary })
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(limit)
        .populate("residentId", "name mobile flatNumber floor wing residentialProfile")

    res.json({ message: "Facility Booking Fetch Successfully", result, total })

})

exports.getResidentBookingById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const result = await FacilityBooking.findById(id)
        .populate("residentId", "name email mobile flatNumber floor wing residentialProfile")

    if (!result) {
        return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Resident Facility Booking Details Send Successfully", result })
})

exports.updateFacilityBookingStatus = asyncHandler(async (req, res) => {

    const { bookingId } = req.params;

    const { status, bookingAmount, rejectReason } = req.body

    const booking = await FacilityBooking.findOne({
        _id: bookingId,
        secretaryId: req.secretary
    })
        .populate("secretaryId", "societyName secretaryName ")
        .populate("residentId", "name email flatNumber floor wing");

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    if (status === "approved") {

        if (!bookingAmount) {
            return res.status(400).json({ message: "Booking amount is required" });
        }

        booking.status = "approved";
        booking.bookingAmount = bookingAmount;
        booking.rejectReason = null;
    }
    else if (status === "rejected") {

        if (!rejectReason) {
            return res.status(400).json({ message: "Reject reason is required" });
        }

        booking.status = "rejected";
        booking.rejectReason = rejectReason;
        booking.bookingAmount = null;
    }
    else {
        return res.status(400).json({ message: "Invalid status" });
    }

    await booking.save();

    const html = BookingTemplate({
        societyName: booking.secretaryId.societyName,
        secretaryName: booking.secretaryId.secretaryName,
        resident: {
            name: booking.residentId.name,
            flatNumber: booking.residentId.flatNumber,
            floor: booking.residentId.floor,
            wing: booking.residentId.wing,
        },
        facilityType: booking.facilityType,
        bookingDate: booking.bookingDate.toLocaleDateString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        bookingAmount: booking.bookingAmount,
        rejectReason: booking.rejectReason
    });


    await sendEmail({
        to: booking.residentId.email,
        subject: `Facility Booking ${booking.status.toUpperCase()}`,
        message: html
    });

    res.status(200).json({
        message: "Booking updated successfully & email sent",
        booking
    });
});

exports.createFacilityBookingBill = asyncHandler(async (req, res) => {

    const { billId } = req.params

    const bill = await FacilityBooking.findById(billId).populate("residentId").populate("secretaryId")

    if (!bill) {
        return res.status(404).json({ message: "No Booking Found" })
    }

    if (bill.status !== "approved") {
        return res.status(400).json({
            message: "Bill can be generated only for approved facility bookings"
        });
    }

    if (bill.billGenerated) {
        return res.status(400).json({
            message: "Bill already generated for this booking"
        });
    }

    const invoiceNumber = await generateInvoiceNumber("FT");

    const billData = {
        societyName: bill.secretaryId.societyName,
        secretaryName: bill.secretaryId.secretaryName,
        residentName: bill.residentId.name,
        facilityType: bill.facilityType,
        bookingDate: bill.bookingDate,
        startTime: bill.startTime,
        endTime: bill.endTime,
        amount: bill.bookingAmount,
        method: "Cash",
        paymentDate: bill.createdAt,
        invoiceNumber: invoiceNumber
    }

    res.status(201).json({
        message: "Bill generated successfully. Invoice will be emailed shortly."
    });

    const html = facilityInvoice(billData)

    setImmediate(async () => {
        try {
            const pdfBuffer = await generatePdf(html);

            await sendEmail({
                to: bill.residentId.email,
                subject: "Facility Booking Invoice",
                message: `
                <p>Dear ${bill.residentId.name},</p>
                <p>Your society facility booking payment has been received successfully.</p>
                <p>Please find the attached invoice for your records.</p>
                <br/>
                <p>Regards,<br/>${bill.secretaryId.societyName}</p>
            `,
                attachments: [
                    {
                        filename: `Facility_Invoice_${bill._id}.pdf`,
                        content: pdfBuffer,
                        contentType: "application/pdf",
                    },
                ]
            });

            bill.billGenerated = true;
            bill.paymentStatus = "paid";
            await bill.save();

            console.log("✅ Invoice email sent");
        } catch (err) {
            console.error("❌ Invoice email failed:", err);
        }
    });
})

