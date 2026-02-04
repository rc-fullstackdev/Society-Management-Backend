module.exports = ({
    societyName,
    secretaryName,
    resident,
    facilityType,
    bookingDate,
    startTime,
    endTime,
    status,
    bookingAmount,
    rejectReason
}) => {

    const statusColor =
        status === "approved" ? "#16a34a" :
            status === "rejected" ? "#dc2626" :
                "#334155";

    const statusBg =
        status === "approved" ? "#ecfdf5" :
            status === "rejected" ? "#fef2f2" :
                "#f8fafc";

    const formattedDate = new Date(bookingDate).toLocaleDateString("en-GB");

    const formatTime = (time) => {
        const [h, m] = time.split(":");
        const d = new Date();
        d.setHours(h, m);
        return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    return `
<div style="
    max-width:600px;
    margin:auto;
    font-family:Segoe UI, Arial, sans-serif;
    background:#ffffff;
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 8px 20px rgba(0,0,0,0.08);
">

    <!-- Header -->
    <div style="
        background:#38bdf8;
        padding:24px;
        text-align:center;
        color:white;
    ">
        <h2 style="margin:0;font-weight:600;">
            ${societyName}
        </h2>
        <p style="margin-top:6px;font-size:14px;opacity:0.95;">
            Facility Booking Update
        </p>
    </div>

    <!-- Content -->
    <div style="padding:28px;color:#334155;">

        <p style="font-size:15px;">
            Dear <strong>${resident.name}</strong>,
        </p>

        <!-- STATUS MAIN BOX -->
        <div style="
            margin-top:18px;
            background:${statusBg};
            border:2px solid ${statusColor};
            border-radius:12px;
            padding:20px;
            text-align:center;
        ">
            <p style="margin:0;font-size:14px;color:#475569;">
                Booking Status
            </p>
            <p style="
                margin:8px 0 0;
                font-size:20px;
                font-weight:700;
                color:${statusColor};
                letter-spacing:1px;
            ">
                ${status.toUpperCase()}
            </p>
        </div>

        <!-- AMOUNT / REASON BOX -->
        ${status === "approved"
            ? `
                <div style="
                    margin-top:16px;
                    background:#f0fdf4;
                    border-left:5px solid #16a34a;
                    padding:16px;
                    border-radius:10px;
                    font-size:15px;
                ">
                    <strong>Amount Payable :</strong>
                    <span style="font-size:18px;font-weight:700;">
                        ₹${bookingAmount}
                    </span>
                </div>
                `
            : ""
        }

        ${status === "rejected"
            ? `
                <div style="
                    margin-top:16px;
                    background:#fff1f2;
                    border-left:5px solid #dc2626;
                    padding:16px;
                    border-radius:10px;
                    font-size:14px;
                ">
                    <strong>Rejection Reason :</strong><br/>
                    ${rejectReason}
                </div>
                `
            : ""
        }

        <!-- BOOKING DETAILS (SECONDARY) -->
        <div style="
            margin-top:22px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:10px;
            padding:16px;
            font-size:13.5px;
            color:#475569;
        ">
            <p><strong>Facility :</strong> ${facilityType}</p>
            <p><strong>Date :</strong> ${formattedDate}</p>
            <p><strong>Time :</strong> ${formatTime(startTime)} – ${formatTime(endTime)}</p>
            <p>
                <strong>Flat :</strong> ${resident.flatNumber},
                <strong>Floor :</strong> ${resident.floor},
                <strong>Wing :</strong> ${resident.wing}
            </p>
        </div>

        <p style="margin-top:18px;font-size:14px;">
            For any queries, please contact the society office.
        </p>

        <p style="margin-top:22px;font-size:14px;">
            Regards,<br/>
            <strong>${secretaryName}</strong><br/>
            ${societyName} Management
        </p>
    </div>

    <!-- Footer -->
    <div style="
        background:#f1f5f9;
        padding:12px;
        text-align:center;
        font-size:12px;
        color:#64748b;
    ">
        This is an automated email. Please do not reply.
    </div>

</div>
`;
};
