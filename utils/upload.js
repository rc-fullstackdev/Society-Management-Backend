const multer = require("multer")

const societyGallery = multer({ storage: multer.diskStorage({}) }).fields([
    {
        name: "societyImage",
        maxCount: 5
    },
    {
        name: "secretaryProfile",
        maxCount: 1
    },
])
const residentialImage = multer({ storage: multer.diskStorage({}) }).single("residentialProfile")
const securityGuardImage = multer({ storage: multer.diskStorage({}) }).single("securityGuardProfile")
const societyComplaint = multer({ storage: multer.diskStorage({}) }).array("complaintImages", 5)
const societyWorkingComplaintImages = multer({ storage: multer.diskStorage({}) }).array("workingImages", 5)

module.exports = { societyGallery, residentialImage, securityGuardImage, societyComplaint, societyWorkingComplaintImages }