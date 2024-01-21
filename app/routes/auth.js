import express from "express";

import {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";

const router = express.Router();

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
export default router;