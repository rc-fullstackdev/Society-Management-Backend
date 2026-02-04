const route = require("express").Router()
const admin = require("../controller/admin.controller")
const { adminProtected } = require("../middleware/auth.middleware")

route

    .get("/get-society-details", adminProtected, admin.societyDetails)
    .patch("/secretary-access/:id", adminProtected, admin.updateSecretaryAccess)
    .post("/contact-us", admin.contactUs)
    .get("/get-contact-details", adminProtected, admin.contactUsDetails)

module.exports = route