const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const {
 addFollowup,
 getFollowupsByCustomer,
 getAllPendingFollowups,
 deleteFollowup
}=require("../controllers/followupController");



router.post("/",verifyToken,addFollowup);

router.get(
 "/pending",
 verifyToken,
 getAllPendingFollowups
);


router.get(
 "/customer/:customerId",
 verifyToken,
 getFollowupsByCustomer
);


router.delete(
 "/:id",
 verifyToken,
 deleteFollowup
);


module.exports=router;