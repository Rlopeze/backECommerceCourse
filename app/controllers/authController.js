import crypto from 'crypto';

import User from '../models/user.js';

import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';

import ErrorHandler from '../utils/errorHandler.js';
import sendToken from '../utils/sendToken.js';
import { getPasswordResetURL } from '../utils/emailTemplate.js';
import sendEmail from '../utils/sendEmail.js';

// Register a user   =>   /api/v1/signup
export const registerUser = catchAsyncErrors(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
  });

  sendToken(user, 201, res);
});

//Login User  =>  /api/v1/login
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password", 401));
  }

  sendToken(user, 200, res);
});

//Logout user   =>   /api/v1/logout
export const logout = catchAsyncErrors(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Forgot Password   =>   /api/v1/password/forgot
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {

  const user = await User.findOne({email: req.body.email})
  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save()

  const resetURL = `${process.env.FRONTEND_URL}/api/v1/password/reset/${resetToken}`
  const message = getPasswordResetURL(user?.name, resetURL)

  try {
    await sendEmail({
      email: user.email,
      subject: "Ecommerce Password Recovery",
      message
    })
    res.status(200).json({
      message: `Email sent to ${user.email}`
    })
  }
  catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password   =>   /api/v1/password/reset/:token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {

  const resetPasswordToken = crypto
  .createHash("sha256")
  .update(req.params.token)
  .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {$gt: Date.now()}
  })

  if (!user) {
    return next(new ErrorHandler("Password reset token is invalid or has been expired", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});