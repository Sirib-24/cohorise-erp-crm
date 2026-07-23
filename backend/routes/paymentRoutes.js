const express=require("express");

const router=express.Router();


const {
addPayment,
getPayments,
getPaymentsByInvoice

}=require("../controllers/paymentController");


const {
verifyToken
}=require("../middleware/authMiddleware");





router.post(
"/",
verifyToken,
addPayment
);



router.get(
"/",
verifyToken,
getPayments
);



router.get(
"/invoice/:invoiceId",
verifyToken,
getPaymentsByInvoice
);



module.exports=router;