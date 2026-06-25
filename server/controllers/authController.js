const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const authService = require("../services/authService");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const formatUserData = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar: user.avatar,
  token: generateToken(user._id),
});

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ success: true, message: "Registered successfully", data: formatUserData(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const user = await authService.loginUser(req.body);
  res.json({ success: true, message: "Login successful", data: formatUserData(user) });
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const user = await authService.googleLoginUser(req.body);
  res.json({ success: true, message: "Google Login successful", data: formatUserData(user) });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  res.json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateProfile(req.user._id, req.body);
  res.json({ success: true, data: formatUserData(updatedUser) });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json({ success: true, message: "OTP sent to your email" });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetPassword(req.params.token, req.body.password);
  res.json({ success: true, message: "Password updated successfully", token: generateToken(user._id) });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  await authService.verifyOtp(req.params.token);
  res.json({ success: true, message: "OTP verified successfully" });
});
