const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  createChallan,
  getChallans,
  getChallanById,
  confirmChallan,
  cancelChallan
} = require("../controllers/challanController");

router.post("/", verifyToken, createChallan);
router.get("/", verifyToken, getChallans);
router.get("/:id", verifyToken, getChallanById);
router.put("/:id/confirm", verifyToken, confirmChallan);
router.put("/:id/cancel", verifyToken, cancelChallan);

module.exports = router;