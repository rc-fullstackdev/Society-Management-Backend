const route = require("express").Router()
const residential = require("../controller/residential.controller")
const { residentialProtected } = require("../middleware/auth.middleware")

route
    .post("/pay-maintenance", residentialProtected, residential.payMaintenance)
    .post("/add-complaint", residentialProtected, residential.societyComplaint)
    .get("/get-complaint", residentialProtected, residential.myComplaints)
    .get("/get-all-maintenance", residentialProtected, residential.getAllMaintenance)
    .get("/get-event", residentialProtected, residential.getAllEvents)
    .get("/get-payment-history", residentialProtected, residential.getPaymentHistory)
    .get("/get-flat-details", residentialProtected, residential.GetFlatDetails)
    .get("/get-resident-guest", residentialProtected, residential.getAllGuestsForResident)
    .post("/add-facility", residentialProtected, residential.facilityBooking)
    .get("/get-facility", residentialProtected, residential.getFacilityBooking)

module.exports = route