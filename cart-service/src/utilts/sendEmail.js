import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const sendEmail = async (to, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GOOGLE_APP_PASSWORD,
        },
    });
    const mailOptions = {
        from: ` <${process.env.EMAIL}>`,
        to: to,
        subject: "Email Confirmation",
        text: "Please confirm your email by clicking the button below.",
        html: html,
    };
    await transporter.sendMail(mailOptions);
}


