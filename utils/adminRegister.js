const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
require("dotenv").config();

(async () => {
    await mongoose.connect(process.env.MONGO_URL);

    const hash = await bcrypt.hash("Admin@1234", 10);

    await Admin.findOneAndUpdate(
        { email: "admin@societysathi.com" },
        { name: "Society Sathi Admin", password: hash, role: "admin" },
        { upsert: true }
    );

    console.log("✅ Fixed admin created");
    await mongoose.disconnect();
})();
