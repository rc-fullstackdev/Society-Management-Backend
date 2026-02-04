module.exports = ({ societyName, secretaryName, residentName, email, password, role }) => {

    const displayRole = role === "Security" ? "Security Guard" : "Resident";

    return `
<div style="max-width: 650px; margin:auto; font-family: Arial, sans-serif; 
    background:#ffffff; border-radius:12px; overflow:hidden;
    box-shadow:0px 4px 15px rgba(0,0,0,0.15);">

    <!-- Header -->
    <div style="background:#38bdf8; padding:30px; text-align:center; color:white;">
        <h1 style="margin:0; font-size:26px;">${societyName}</h1>
        <p style="margin-top:8px; font-size:18px;">🔑 Your ${displayRole} Account Credentials</p>
    </div>

    <!-- Body -->
    <div style="padding:30px;">

        <p style="font-size:18px; color:#333;">
            Hello <strong>${displayRole} ${residentName || ""}</strong>,
        </p>

        <p style="font-size:16px; color:#555;">
            Your account has been successfully created in <strong>${societyName}</strong>. Please find your login details below:
        </p>

        <!-- Credentials Box -->
        <div style="
            background:#e0f7ff;
            border-left:6px solid #38bdf8;
            padding:25px;
            margin-top:25px;
            border-radius:10px;
            box-shadow:0px 2px 10px rgba(0,0,0,0.08);">

            <p style="margin:0; font-size:17px; color:#333; line-height:1.6;">
                <strong>Email:</strong> ${email}
            </p>
            <p style="margin-top:12px; font-size:17px; color:#333; line-height:1.6;">
                <strong>Password:</strong> ${password}
            </p>

            <p style="margin-top:18px; font-size:16px; color:#555;">
                Please keep this information safe and do not share it with anyone.
            </p>
        </div>

        <p style="font-size:16px; margin-top:30px; color:#444;">
            You can now log in to your resident portal and access all features.
        </p>

        <p style="font-size:16px; margin-top:30px; line-height:24px;">
            Regards,<br>
            <strong>${secretaryName}</strong><br>
            <strong>${societyName} Management</strong>
        </p>
    </div>

    <div style="background:#f0f9ff; padding:12px; text-align:center; font-size:14px; color:#666;">
        This is an automated email — please do not reply.
    </div>
</div>
`;
};
