import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
export const signupController = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        message: "Invalid email address",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(401).json({
        message: "Username already taken ",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(401).json({
        message: "Email already taken ",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        message: "User created successfully",
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      });
    } else {
      res.status(400).json({
        message: "Invalid user credentials",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
    console.log("Problem in signUp controller ", error.message);
  }
};
export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const comparePassword = await bcrypt.compare(password, user.password);

    if (!user || !comparePassword) {
      res.status(404).json({
        message: "Invalid username or password",
        success: false,
      });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      message: "User created successfully",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
    console.log("Problem in Login controller ", error.message);
  }
};
export const logoutController = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: "0" });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
    console.log("Problem in logout controller", error.message);
  }
};

export const getUser = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(201).json(user);
};

export default { signupController, loginController, logoutController, getUser };
