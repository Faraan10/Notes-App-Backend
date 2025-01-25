import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import sendOtp from "../utils/emailService.js";
import cors from "cors";

const router = express.Router();
router.use(cors());
router.get("/", async (req, res) => {
  const data = await User.find({});
  res.status(200).json(data);
});

router.get("/get", async (req, res) => {
  const token = req.headers.token;
  if (!token) {
    res.status(401).json({ message: "No Token" });
    return;
  }

  const decodeToken = jwt.decode(token, process.env.SECRET_KEY);

  res.status(200).json(decodeToken);
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(401).json({ message: "You have to fill the required fields" });
    return;
  }

  const checkUser = await User.findOne({
    email: email,
  });

  if (checkUser) {
    res.status(401).json({ message: "User with this email already exists" });
    return;
  }

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const createUser = await User.create({
      name: name,
      email: email,
      password: hashPassword,
    });
    if (!createUser) {
      res.status(401).json({ message: "Trouble registering the user" });
      return;
    }
    res.status(201).json({ createUser, message: "User Registered" });
  } catch (error) {
    res.status(500).json({ error, message: "Internal Server Error" });
    return;
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(401).json({ message: "Please fill the required fields" });
    return;
  }

  const findUser = await User.findOne({
    email: email,
  });

  if (!findUser) {
    res.status(401).json({ message: "User does not exist" });
    return;
  }

  const comparePassword = await bcrypt.compare(password, findUser.password);

  if (!comparePassword) {
    res.status(401).json({ message: "Invalid login Credentials" });
    return;
  }

  try {
    const token = jwt.sign(
      {
        name: findUser.name,
        email: findUser.email,
      },
      process.env.SECRET_KEY
    );
    if (!token) {
      res.status(401).json({ message: "Trouble signing in" });
      return;
    }
    res.status(200).json({ token, message: "User Logged in" });
  } catch (error) {
    res.status(500).json({ error, message: "Internal Server Error" });
    return;
  }
});

//
// staging functionality
//
router.post("/login/request-otp", async (req, res) => {
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const { email } = req.body;

  if (!email) {
    return res
      .status(401)
      .json({ message: "You have not filled the required fields" });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const otp = generateOtp(); // Ensure OTP is generated correctly
  const hashedOtp = await bcrypt.hash(otp, 10); // Now bcrypt will hash a valid OTP

  user.otp = hashedOtp;
  user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
  await user.save();

  const emailResponse = await sendOtp(email, otp);
  if (!emailResponse.success) {
    return res.status(500).json({ message: "Failed to send OTP" });
  }

  res.status(200).json({ message: "OTP sent successfully" });
});
//
//  verify OTP Route

router.post("/login/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isValidOTP = await bcrypt.compare(otp, user.otp);
  const isExpired = Date.now() > user.otpExpires;

  if (!isValidOTP || isExpired) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // Clear OTP after successful login
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  // Generate JWT Token
  const token = jwt.sign(
    { name: user.name, email: user.email },
    process.env.SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.status(200).json({ message: "User Logged In", token });
});

// till here
//
//
router.put("/update/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(401).json({ message: "No Id" });
    return;
  }

  if (id.length < 24) {
    res.status(401).json({ message: "Enter a valid id" });
    return;
  }

  const { name, email, password } = req.body;

  const findUser = await User.findById(id);

  if (!findUser) {
    res.status(401).json({ message: "User does not exist" });
    return;
  }

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        name: name,
        email: email,
        password: hashPassword,
      },
      { new: true }
    );
    if (!updateUser) {
      res.status(401).json({ message: "Trouble Updating details" });
      return;
    }
    res
      .status(200)
      .json({ updateUser, message: "Details Updated Successfully" });
  } catch (error) {
    res.status(500).json({ error, message: "Internal Server Error" });
    return;
  }
});

router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(401).json({ message: "No Id" });
    return;
  }

  if (id.length < 24) {
    res.status(401).json({ message: "Enter a valid id" });
    return;
  }

  const findUser = await User.findById(id);

  if (!findUser) {
    res.status(401).json({ message: "User does not exist" });
    return;
  }

  try {
    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser) {
      res.status(401).json({ message: "Trouble Deleting User" });
      return;
    }
    res.status(200).json({ deleteUser, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error, message: "Internal Server Error" });
    return;
  }
});

export default router;
