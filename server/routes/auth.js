const express = require("express");
const router = express.Router();

const { register, login, getMe, updateUserRole, unlockUser } = require("../controllers/authController");
const verifyToken = require("../middleware/auth"); // default export, aliased to match main branch convention
const { authLimiter, registerLimiter } = require("../middleware/rateLimiter");
const adminOnly = require("../middleware/adminOnly");

// Register
router.post("/register", registerLimiter, register);

// Login
router.post("/login", authLimiter, login);

// Get current user (protected)
router.get("/me", verifyToken, getMe);

// Admin-only: update a user's role
router.patch("/users/:userId/role", verifyToken, updateUserRole);

// Admin-only: unlock user account
router.patch("/users/:id/unlock", verifyToken, adminOnly, unlockUser);

module.exports = router;