const nodemailer = require("nodemailer");
const logger = require("../../config/logger");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"VidyaMitra 🎓" <${process.env.EMAIL_USER}>`,
      to, subject, html,
      text: html.replace(/<[^>]*>/g, ""),
    });

    logger.info(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    logger.error(`❌ Email failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };