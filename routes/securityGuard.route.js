const route = require("express").Router()
const securityGuard = require("../controller/securityGuard.controller")
const { securityGuardProtected, secretaryProtected } = require("../middleware/auth.middleware")

route
    .post("/guest-information", securityGuardProtected, securityGuard.guestInformation)
    .get("/get-all-residential", securityGuardProtected, securityGuard.GetAllResidential)
    .get("/get-all-guest", securityGuardProtected, securityGuard.getAllGuest)
    .patch("/guest-out/:id", securityGuardProtected, securityGuard.markGuestOutTime);

module.exports = route