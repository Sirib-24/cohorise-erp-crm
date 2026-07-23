const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
  res.json({ message: "Auth Routes Working ✅" });
});

router.post("/login", loginUser);

// Protected test route
router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "You accessed a protected route ✅",
    user: req.user
  });
});

module.exports = router;