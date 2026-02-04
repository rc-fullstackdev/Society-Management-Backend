module.exports = ({ societyName, secretaryName, name, title, description, date }) => {
    return `
<div style="max-width: 650px; margin:auto; font-family: Arial, sans-serif; 
    background:#ffffff; border-radius:12px; overflow:hidden;
    box-shadow:0px 4px 15px rgba(0,0,0,0.15);">

    <!-- Header -->
    <div style="background:#38bdf8; padding:30px; text-align:center; color:white;">
        <h1 style="margin:0; font-size:26px;">${societyName}</h1>
        <p style="margin-top:8px; font-size:18px;">📢 Society Event Announcement</p>
    </div>

    <!-- Body -->
    <div style="padding:30px;">

        <p style="font-size:18px; color:#333;">
            Hello <strong>${name || "Resident"}</strong>,
        </p>

        <p style="font-size:16px; color:#555;">
            We are excited to invite you to the following event:
        </p>

        <!-- Main Event Box (Large + Focused) -->
        <div style="
            background:#e0f7ff;
            border-left:6px solid #38bdf8;
            padding:25px;
            margin-top:25px;
            border-radius:10px;
            box-shadow:0px 2px 10px rgba(0,0,0,0.08);">

            <h2 style="margin:0; font-size:28px; color:#0d6efd;">
                ${title}
            </h2>

            <!-- Date Badge -->
            <div style="
                display:inline-block;
                margin-top:12px;
                background:#38bdf8;
                color:white;
                padding:6px 14px;
                border-radius:20px;
                font-size:15px;">
                📅 ${date}
            </div>

            <!-- Description -->
            <p style="margin-top:18px; font-size:17px; color:#333; line-height:1.6;">
                ${description}
            </p>
        </div>

        <p style="font-size:16px; margin-top:30px; color:#444;">
            We hope to see you there and make this event memorable together!
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
