module.exports = ({ societyName, secretaryName, name, month, amount, dueDate }) => {
    return `
<div style="max-width: 600px; margin:auto; font-family: Arial, sans-serif; 
    background:#ffffff; border-radius:12px; overflow:hidden;
    box-shadow:0px 4px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#38bdf8; padding:20px; text-align:center; color:white;">
        <h1 style="margin:0; font-size:24px;">${societyName}</h1>
        <p style="margin:4px 0 0; font-size:16px;">Maintenance Reminder</p>
    </div>

    <!-- Body -->
    <div style="padding:25px;">
        <p style="font-size:16px; color:#333;">
            Dear <strong>${name || "Resident"}</strong>,
        </p>

        <p style="font-size:15px; color:#555;">
            Your monthly maintenance has been generated. Below are your details:
        </p>

        <!-- Info Box -->
        <div style="
            background:#e0f7ff;
            border-left:5px solid #38bdf8;
            padding:15px;
            margin-top:15px;
            border-radius:8px;">
            
            <p style="margin:8px 0; font-size:15px;">
                <strong>Month :</strong> ${month}
            </p>

            <p style="margin:8px 0; font-size:15px;">
                <strong>Amount :</strong> ₹${amount}
            </p>

            <p style="margin:8px 0; font-size:15px;">
                <strong>Due Date :</strong> ${dueDate}
            </p>
        </div>

        <p style="font-size:15px; margin-top:20px; color:#444;">
            Please ensure payment before the due date to avoid penalties.
        </p>

        <p style="font-size:15px; margin-top:25px; line-height:22px;">
            Thank you,<br>
            <strong>${secretaryName}</strong><br>
            <strong>${societyName} Management</strong>
        </p>
    </div>

    <!-- Footer -->
    <div style="background:#f0f9ff; padding:10px; text-align:center; font-size:13px; color:#666;">
        This is an automated message. Please do not reply.
    </div>
</div>
`;
};
