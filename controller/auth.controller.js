const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cloud = require("../utils/cloudinary")
const path = require("path")
const { societyGallery, residentialImage, securityGuardImage } = require("../utils/upload")
const Admin = require("../models/auth/Admin")
const Secretary = require("../models/auth/Secretary")
const Residential = require("../models/auth/Residential")
const SecurityGuard = require("../models/auth/SecurityGuard")
const { sendEmail } = require("../utils/email")
const LoginTemplate = require("../utils/LoginTemplate")


/* ------------------------------ Admin Auth Start ------------------------------ */

exports.AdminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const result = await Admin.findOne({ email })

    if (!result) {
        return res.status(401).json({ message: "Invalid Email" })
    }

    const verify = await bcrypt.compare(password, result.password)

    if (!verify) {
        return res.status(401).json({ message: "Invalid Password" })
    }

    const token = jwt.sign({ _id: result._id }, process.env.JWT_KEY)

    res.cookie("ADMIN", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: true, sameSite: "None" })

    res.json({ message: "Admin Login Successfully" })
})

exports.AdminLogout = asyncHandler(async (req, res) => {
    res.clearCookie("ADMIN")
    res.json({ message: "Admin Logout Successfully" })
})

/* ------------------------------ Admin Auth End ------------------------------ */


/* ------------------------------ Secretary Auth Start ------------------------ */

exports.secretaryRegister = asyncHandler(async (req, res) => {
    societyGallery(req, res, async (err) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ message: "multer error" });
        }

        const { societyName, societyAddress, secretaryName, email, mobile, password } = req.body;

        const result = await Secretary.findOne({ email });
        if (result) {
            return res.status(401).json({ message: "Email Already Exist" });
        }

        const hash = await bcrypt.hash(password, 10);

        //----- Upload all societyImages -----//

        const allSocietyImages = [];

        if (req.files && req.files.societyImage) {
            for (const img of req.files.societyImage) {
                const { secure_url } = await cloud.uploader.upload(img.path);
                allSocietyImages.push(secure_url);
            }
        }

        //----- Upload secretaryProfile -----//

        let secretaryProfileUrl = "";

        if (req.files && req.files.secretaryProfile) {
            const file = req.files.secretaryProfile[0];
            const { secure_url } = await cloud.uploader.upload(file.path);
            secretaryProfileUrl = secure_url;
        }

        await Secretary.create({
            societyName,
            societyAddress,
            societyImage: allSocietyImages,
            secretaryName,
            email,
            mobile,
            password: hash,
            secretaryProfile: secretaryProfileUrl
        });

        res.status(201).json({ message: "Secretary Register Successfully" });
    });
});

exports.secretaryLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const result = await Secretary.findOne({ email })

    if (!result) {
        return res.status(401).json({ message: "Invalid Email" })
    }

    if (result.isActive === false) {
        return res.status(403).json({ message: "Your account has been deactivated by admin" })
    }

    const verify = await bcrypt.compare(password, result.password)

    if (!verify) {
        return res.status(401).json({ message: "Invalid Password" })
    }

    const token = jwt.sign({ _id: result._id, name: result.name }, process.env.JWT_KEY)

    res.cookie("SECRETARY", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: true, sameSite: "None" })

    res.json({
        message: "Secretary Login Successfully",
        id: result._id,
        secretaryName: result.secretaryName,
        profileImage: result.secretaryProfile
    })
})

exports.SecretaryLogout = asyncHandler(async (req, res) => {
    res.clearCookie("SECRETARY")
    res.json({ message: "Secretary Logout Successfully" })
})

/* ------------------------------ Secretary Auth End  ------------------------- */


/* ------------------------------ Residential Auth End  ------------------------- */

exports.residentialRegister = asyncHandler(async (req, res) => {
    residentialImage(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: "multer error" })
        }

        const { name, email, mobile, password, flatNumber, floor, wing, residentialProfile } = req.body

        const result = await Residential.findOne({ email })

        if (result) {
            return res.status(401).json({ message: "Email Already Exist" })
        }

        const flatExists = await Residential.findOne({ flatNumber });

        if (flatExists) {
            return res.status(401).json({ message: `Flat number ${flatNumber} is already assigned` })
        }

        const hash = await bcrypt.hash(password, 10)

        const { secure_url } = await cloud.uploader.upload(req.file.path)

        await Residential.create({
            secretaryId: req.secretary,
            name,
            email,
            mobile,
            password: hash,
            flatNumber,
            floor,
            wing,
            residentialProfile: secure_url
        })

        const secretary = await Secretary.findById(req.secretary);

        const html = LoginTemplate({
            societyName: secretary.societyName,
            secretaryName: secretary.secretaryName,
            residentName: name,
            email,
            password,
            role: "Resident"
        });

        await sendEmail({
            to: email,
            subject: "Your Account Login Email & Password",
            message: html
        });

        res.status(201).json({ message: "Residential Register Successfully" })
    })
})

exports.residentialLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const result = await Residential.findOne({ email })

    if (!result) {
        return res.status(401).json({ message: "Invalid Email" })
    }

    if (result.isActive === false) {
        return res.status(403).json({ message: "Your account has been deactivated by secretary" })
    }

    const verify = await bcrypt.compare(password, result.password)

    if (!verify) {
        return res.status(401).json({ message: "Invalid Password" })
    }

    const token = jwt.sign({ _id: result._id, name: result.name }, process.env.JWT_KEY)

    res.cookie("RESIDENTIAL", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: true, sameSite: "None" })

    res.json({
        message: "Residential Login Successfully",
        id: result._id,
        name: result.name,
        residentialProfile: result.residentialProfile
    })
})

exports.residentialLogout = asyncHandler(async (req, res) => {
    res.clearCookie("RESIDENTIAL")
    res.status(200).json({ message: "Residential Logout Successfully" })
})

/* ------------------------------ Residential Auth End  ------------------------- */


/* ------------------------------ Security Guard Auth End  ------------------------- */

exports.securityGuardRegister = asyncHandler(async (req, res) => {
    securityGuardImage(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: "multer error" })
        }

        const { secretaryId, name, email, mobile, password, securityGuardProfile } = req.body

        const result = await SecurityGuard.findOne({ email })

        if (result) {
            return res.status(401).json({ message: "Email Already Exist" })
        }

        const hash = await bcrypt.hash(password, 10)

        const { secure_url } = await cloud.uploader.upload(req.file.path)

        await SecurityGuard.create({
            secretaryId: req.secretary,
            name,
            email,
            mobile,
            password: hash,
            securityGuardProfile: secure_url
        })

        const secretary = await Secretary.findById(req.secretary);

        const html = LoginTemplate({
            societyName: secretary.societyName,
            secretaryName: secretary.secretaryName,
            residentName: name,
            email,
            password,
            role: "Security"
        });

        await sendEmail({
            to: email,
            subject: "Your Account Login Email & Password",
            message: html
        });

        res.status(201).json({ message: "Security Guard Register Successfully" })
    })
})

exports.securityGuardLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const result = await SecurityGuard.findOne({ email })

    if (!result) {
        return res.status(401).json({ message: "Invalid Email" })
    }

    if (result.isActive === false) {
        return res.status(403).json({ message: "Your account has been deactivated by secretary" })
    }

    const verify = await bcrypt.compare(password, result.password)

    if (!verify) {
        return res.status(401).json({ message: "Invalid Password" })
    }

    const token = jwt.sign({ _id: result._id, name: result.name }, process.env.JWT_KEY)

    res.cookie("SECURITYGUARD", token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: true, sameSite: "None" })

    res.json({
        message: "Security Guard Login Successfully",
        id: result._id,
        name: result.name,
        securityGuardProfile: result.securityGuardProfile
    })
})

exports.securityGuardLogout = asyncHandler(async (req, res) => {
    res.clearCookie("SECURITYGUARD")
    res.json({ message: "Security Guard Logout Successfully" })
})

/* ------------------------------ Security Guard Auth End  ------------------------- */

