const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const SecurityGuard = require("../models/auth/SecurityGuard")
const Residential = require("../models/auth/Residential")
const Secretary = require("../models/auth/Secretary")

exports.adminProtected = asyncHandler(async (req, res, next) => {
    const token = req.cookies.ADMIN

    if (!token) {
        return res.status(401).json({ message: "no cookie found" })
    }

    jwt.verify(token, process.env.JWT_KEY, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ message: "invalid token", error: err.message })
        }

        req.admin = data._id
        next()
    })
})

exports.secretaryProtected = asyncHandler(async (req, res, next) => {
    const token = req.cookies.SECRETARY

    if (!token) {
        return res.status(401).json({ message: "Session expired. Please login again" })
    }

    jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ message: "invalid token", error: err.message })
        }

        req.secretary = data._id

        const result = await Secretary.findById(req.secretary)

        if (result.isActive === false) {
            return res.status(403).json({
                message: "Your account has been deactivated by admin"
            })
        }

        next()
    })
})

exports.residentialProtected = asyncHandler(async (req, res, next) => {
    const token = req.cookies.RESIDENTIAL

    if (!token) {
        return res.status(401).json({ message: "Session expired. Please login again" })
    }

    jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
        if (err) {
            console.log(err)
            return res.status(401).json({ message: "invalid token", error: err.message })
        }

        const resident = await Residential.findById(data._id);

        if (!resident) {
            return res.status(404).json({ message: "Residential not found" });
        }

        if (resident.isActive === false) {
            return res.status(403).json({
                message: "Your account has been deactivated by secretary"
            })
        }

        req.residential = resident
        next()
    })
})

exports.securityGuardProtected = asyncHandler(async (req, res, next) => {
    const token = req.cookies.SECURITYGUARD;

    if (!token) {
        return res.status(401).json({ message: "Session expired. Please login again" });
    }

    jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
        if (err) {
            return res.status(401).json({ message: "invalid token", error: err.message });
        }

        const guard = await SecurityGuard.findById(data._id);

        if (!guard) {
            return res.status(404).json({ message: "Security guard not found" });
        }

        if (guard.isActive === false) {
            return res.status(403).json({ message: "Your account has been deactivated by secretary" })
        }

        req.securityGuard = guard;
        next();
    });
});
