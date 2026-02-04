const nodemailer = require("nodemailer");

exports.sendEmail = ({ to, subject, message, attachments = [] }) =>
    new Promise((resolve, reject) => {
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
        });

        transport.sendMail(
            {
                from: `"Society Management" <${process.env.EMAIL}>`,
                to,
                subject,
                html: message,
                attachments,
            },
            (err, info) => {
                if (err) {
                    console.error("Email error:", err);
                    return reject(err);
                }
                console.log("Email sent:", info.response);
                resolve(info);
            }
        );
    });
