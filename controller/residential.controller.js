const asyncHandler = require("express-async-handler")
const Payment = require("../models/Payment");
const Maintenance = require("../models/secretary/Maintenance");
const Secretary = require("../models/auth/Secretary");
const { sendEmail } = require("../utils/email");
const maintenanceReceipt = require("../utils/maintenanceReceipt");
const Residential = require("../models/auth/Residential");
const crypto = require("crypto");
const razorpay = require("../utils/razorpay");
const SocietyComplaint = require("../models/residential/SocietyComplaint");
const { societyComplaint } = require("../utils/upload");
const cloud = require("../utils/cloudinary")
const path = require("path");
const Event = require("../models/secretary/Event");
const GuestInformation = require("../models/security-guard/GuestInformation");
const FacilityBooking = require("../models/residential/FacilityBooking");
const generatePdf = require("../utils/generatePdf");
const generateInvoiceNumber = require("../utils/generateSimpleInvoiceNumber");


exports.getAllMaintenance = asyncHandler(async (req, res) => {
    const { limit = 2, start = 0 } = req.query;
    const resident = req.residential;

    const total = await Maintenance.countDocuments({
        secretaryId: resident.secretaryId
    });

    const maintenances = await Maintenance.find({
        secretaryId: resident.secretaryId
    })
        .sort({ dueDate: -1 })
        .skip(start)
        .limit(limit);

    const maintenanceIds = maintenances.map(m => m._id);

    const payments = await Payment.find({
        residentId: resident._id,
        maintenanceId: { $in: maintenanceIds }
    });

    const paymentMap = {};
    payments.forEach(p => {
        paymentMap[p.maintenanceId.toString()] = p;
    });

    const result = maintenances.map(m => {
        const payment = paymentMap[m._id.toString()];

        let status = "Pending";
        if (payment?.status === "Paid") {
            status = "Paid";
        } else if (!payment && new Date() > m.dueDate) {
            status = "Overdue";
        }

        return {
            ...m.toObject(),
            status,
            paymentMethod: payment?.method || null,
            paymentId: payment?._id || null
        };
    });

    res.json({
        message: "Get All Maintenance History Successfully",
        result,
        total
    });
});

exports.payMaintenance = asyncHandler(async (req, res) => {
    const {
        method,
        month,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body;

    const resident = req.residential;
    const now = new Date();

    // ===============================
    // 📅 MONTH HELPERS
    // ===============================
    const formatMonth = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const currentMonth = formatMonth(now);

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = formatMonth(lastMonthDate);

    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = formatMonth(nextMonthDate);

    // ===============================
    // ✅ NORMALIZE USER SELECTED MONTH
    // ===============================
    if (!month) {
        return res.status(400).json({ message: "Month is required" });
    }

    const selectedMonth = month.slice(0, 7); // YYYY-MM

    // ===============================
    // ❌ MONTH VALIDATION
    // ===============================
    if (![lastMonth, currentMonth, nextMonth].includes(selectedMonth)) {
        return res.status(400).json({
            message:
                selectedMonth > nextMonth
                    ? "You can only pay one month in advance"
                    : "You can only pay last unpaid or current month maintenance",
        });
    }

    // ===============================
    // 🔎 FIND MAINTENANCE
    // ===============================
    const maintenance = await Maintenance.findOne({
        month: selectedMonth,
        secretaryId: resident.secretaryId,
    });

    if (!maintenance) {
        return res.status(404).json({
            message: "Maintenance not found for selected month",
        });
    }

    // ===============================
    // 🔁 ALREADY PAID CHECK
    // ===============================
    const alreadyPaid = await Payment.findOne({
        residentId: resident._id,
        maintenanceId: maintenance._id,
        status: "Paid",
    });

    if (alreadyPaid) {
        return res.status(400).json({
            message:
                selectedMonth === currentMonth
                    ? "You have already paid maintenance for this month"
                    : selectedMonth === lastMonth
                        ? "You have already paid maintenance for last month"
                        : "You have already paid maintenance in advance",
        });
    }

    let newPayment;

    // ===============================
    // 💳 RAZORPAY – CREATE ORDER
    // ===============================
    if (method === "Razorpay" && !razorpay_payment_id) {
        const receiptId = `maint_${maintenance._id
            .toString()
            .slice(-6)}_${resident._id.toString().slice(-6)}`;

        const order = await razorpay.orders.create({
            amount: maintenance.amount * 100,
            currency: "INR",
            receipt: receiptId,
        });

        return res.status(200).json({
            orderId: order.id,
            amount: maintenance.amount,
            currency: "INR",
            month: selectedMonth,
        });
    }

    // ===============================
    // 🔐 RAZORPAY – VERIFY PAYMENT
    // ===============================
    if (method === "Razorpay" && razorpay_payment_id) {
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Payment verification failed",
            });
        }

        newPayment = await Payment.create({
            secretaryId: resident.secretaryId,
            maintenanceId: maintenance._id,
            residentId: resident._id,
            amountPaid: maintenance.amount,
            paymentDate: new Date(),
            method: "Online",
            status: "Paid",
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
        });
    }

    if (!newPayment) {
        return res.status(400).json({ message: "Invalid payment request" });
    }

    // ===============================
    // 📧 SEND EMAIL RECEIPT
    // ===============================
    const secretary = await Secretary.findById(resident.secretaryId);

    const invoiceNumber = await generateInvoiceNumber("MT");

    const html = maintenanceReceipt({
        societyName: secretary.societyName,
        secretaryName: secretary.secretaryName,
        residentName: resident.name,
        month: maintenance.month,
        amount: newPayment.amountPaid,
        method: newPayment.method,
        paymentDate: newPayment.paymentDate,
        receiptNumber: invoiceNumber,
    });

    // ===============================
    // ✅ FINAL RESPONSE
    // ===============================
    res.status(201).json({
        message: "Maintenance payment successful",
        month: maintenance.month,
        paymentId: newPayment._id,
    });

    setImmediate(async () => {
        try {
            const pdfBuffer = await generatePdf(html);

            await sendEmail({
                to: resident.email,
                subject: "Society Maintenance Invoice",
                message: `
                <p>Dear ${resident.name},</p>
                <p>Your society maintenance payment has been received successfully.</p>
                <p>Please find the attached invoice for your records.</p>
                <br/>
                <p>Regards,<br/>${secretary.societyName}</p>
            `,
                attachments: [
                    {
                        filename: `Maintenance_Invoice_${newPayment._id}.pdf`,
                        content: pdfBuffer,
                        contentType: "application/pdf",
                    },
                ],
            });

            console.log("✅ Invoice email sent");
        } catch (err) {
            console.error("❌ Invoice email failed:", err);
        }
    });
});

exports.getPaymentHistory = asyncHandler(async (req, res) => {
    const { limit = 2, start = 0 } = req.query;
    const total = await Payment.countDocuments({ residentId: req.residential._id });
    const result = await Payment.find({ residentId: req.residential._id }).sort({ paymentDate: -1 }).skip(start).limit(limit)
    res.json({ message: "Get All Payment History Successfully", result, total })
})

exports.GetFlatDetails = asyncHandler(async (req, res) => {
    const result = await Residential.find({ _id: req.residential })
        .select("flatNumber floor wing residentialProfile mobile secretaryId")
        .populate("secretaryId", "societyName societyAddress societyImage name mobile secretaryProfile")
    res.json({ message: "Get Flat Details Successfully", result })
})

exports.getAllEvents = asyncHandler(async (req, res) => {
    const resident = req.residential;
    const { limit, start } = req.query
    const total = await Event.countDocuments({ secretaryId: resident.secretaryId })
    const result = await Event.find({ secretaryId: resident.secretaryId }).sort({ date: -1 }).skip(start).limit(limit)
    res.json({ message: "Get All Event Successfully", result, total })
})

exports.societyComplaint = asyncHandler(async (req, res) => {

    societyComplaint(req, res, async (err) => {

        if (err) {
            return res.status(400).json({ message: "multer error" })
        }

        const { category, title, description, priority, status } = req.body

        const resident = req.residential;

        if (!resident) {
            return res.status(404).json({ message: "Resident not fount" })
        }

        const allImages = []

        if (req.files) {
            for (const item of req.files) {
                const { secure_url } = await cloud.uploader.upload(item.path)
                allImages.push(secure_url);
            }
        }

        await SocietyComplaint.create({
            secretaryId: resident.secretaryId,
            residentId: resident._id,
            category,
            title,
            description,
            priority,
            complaintImages: allImages,
            status
        })
        res.status(201).json({ message: "Complaint Send Successfully" })
    })
})

exports.myComplaints = asyncHandler(async (req, res) => {
    const { limit, start } = req.query
    const total = await SocietyComplaint.countDocuments()
    const result = await SocietyComplaint.find().skip(start).limit(limit)
        .select("title description category priority complaintImages workingImages status")
        .sort({ createdAt: -1 });

    res.json({ message: "Complaint Fetch Successfully", result, total })
})

exports.getAllGuestsForResident = asyncHandler(async (req, res) => {

    const { start, limit } = req.query

    const total = await GuestInformation.countDocuments({ residentId: req.residential, outTime: { $ne: null } })

    const result = await GuestInformation.find({ residentId: req.residential, outTime: { $ne: null } })
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(limit)

    res.json({ message: "Guest Information Fetched Successfully", result, total })
})

exports.facilityBooking = asyncHandler(async (req, res) => {

    const { facilityType, bookingDate, startTime, endTime } = req.body

    const resident = req.residential;

    if (!resident) {
        return res.status(404).json({ message: "Resident not found" })
    }

    if (startTime >= endTime) {
        return res.status(400).json({
            message: "End time must be greater than start time"
        });
    }

    const dateOnly = new Date(bookingDate);
    dateOnly.setHours(0, 0, 0, 0);

    const existingBooking = await FacilityBooking.findOne({
        secretaryId: resident.secretaryId,
        facilityType,
        bookingDate: dateOnly,
        $expr: {
            $and: [
                { $lt: ["$startTime", endTime] },
                { $gt: ["$endTime", startTime] }
            ]
        }
    })

    if (existingBooking) {
        return res.status(400).json({
            message: "This time slot is already booked"
        });
    }

    await FacilityBooking.create({
        secretaryId: resident.secretaryId,
        residentId: resident._id,
        facilityType,
        bookingDate: dateOnly,
        startTime,
        endTime,
        billGenerated: false
    })

    res.status(201).json({ message: "Facility Booking Successfully" })
})

exports.getFacilityBooking = asyncHandler(async (req, res) => {

    const { start, limit } = req.query

    const total = await FacilityBooking.countDocuments({ residentId: req.residential })

    const booking = await FacilityBooking.find({ residentId: req.residential })
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(limit)

    res.json({ message: "Fetch Booking Facility Successfully", booking, total })

})


