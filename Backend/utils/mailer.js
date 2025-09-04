/* mailer.js */
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4,
});

export async function sendDemoEmail(data) {
  const html = `
    <h2>📅 New Demo Booking</h2>
    <ul>
      <li><strong>Name:</strong> ${data.first_name} ${data.last_name}</li>
      <li><strong>Email:</strong> ${data.work_email}</li>
      <li><strong>Company:</strong> ${data.company}</li>
      <li><strong>Phone:</strong> ${data.phone_number || "—"}</li>
      <li><strong>Company Size:</strong> ${data.company_size}</li>
      <li><strong>Use Case:</strong> ${data.primary_use_case}</li>
      <li><strong>Preferred Date:</strong> ${data.preferred_date || "—"}</li>
      <li><strong>Preferred Time:</strong> ${data.preferred_time || "—"}</li>
      <li><strong>Additional Info:</strong> ${data.additional_info || "—"}</li>
    </ul>
  `;
  await transporter.sendMail({
    from: `"Demo Bot" <${process.env.SMTP_USER}>`,
    to: process.env.TO_EMAIL,
    subject: "New Demo Booking Request",
    html,
  });
}
