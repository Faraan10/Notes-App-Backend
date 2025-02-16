import nodemailer from "nodemailer";
import dotenv from "dotenv";

const nv = dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// transporter.verify((error, success) => {
//   if (error) {
//     console.log("Error connecting to SMTP:", error);
//   } else {
//     console.log("SMTP connected successfully!");
//   }
// });

const sendOtp = async (email, otp) => {
  const mailFormat = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Your OTP code for Notes Application",
    text: `Dear User,

Your OTP code is ${otp}. This OTP will be valid for the next 5 minutes`,
  };

  try {
    await transporter.sendMail(mailFormat);
    console.log("Otp sent successfully");
    return { success: true };
  } catch (err) {
    console.log("Failed to send otp email", err);
    return { success: false, err };
  }
};

export default sendOtp;
