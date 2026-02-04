const route = require("express").Router()
const auth = require("../controller/auth.controller")
const { secretaryProtected } = require("../middleware/auth.middleware")

route

    /* --------------------- Admin Route Start -------------------- */

    .post("/admin-login", auth.AdminLogin)
    .post("/admin-logout", auth.AdminLogout)

    /* --------------------- Admin Route End ----------------------- */

    /* --------------------- Secreatry Route End ------------------- */

    .post("/secreatry-register", auth.secretaryRegister)
    .post("/secreatry-login", auth.secretaryLogin)
    .post("/secreatry-logout", auth.SecretaryLogout)

    /* --------------------- Secreatry Route End ------------------- */

    /* --------------------- Secreatry Route End ------------------- */

    .post("/residential-register", secretaryProtected, auth.residentialRegister)
    .post("/residential-login", auth.residentialLogin)
    .post("/residential-logout", auth.residentialLogout)

    /* --------------------- Secreatry Route End ------------------- */

    /* --------------------- Secreatry Route End ------------------- */

    .post("/securityGuard-register", secretaryProtected, auth.securityGuardRegister)
    .post("/securityGuard-login", auth.securityGuardLogin)
    .post("/securityGuard-logout", auth.securityGuardLogout)

/* --------------------- Secreatry Route End ------------------- */


module.exports = route