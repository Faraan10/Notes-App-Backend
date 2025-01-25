import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    username: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
  },
});

const sendOtp = async (email, otp) => {
  const mailFormat = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Your OTP code for Notes Application",
    text: `Your OTP code is ${otp}. It will expire in the next 5 minutes`,
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
