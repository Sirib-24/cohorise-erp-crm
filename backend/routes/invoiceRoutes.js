const express=require("express");

const router=express.Router();



const {

createInvoice,
getInvoices,
getInvoiceById,
getPendingInvoices

}=require("../controllers/invoiceController");



const {
verifyToken
}=require("../middleware/authMiddleware");





// Create invoice

router.post(
"/",
verifyToken,
createInvoice
);





// All invoices

router.get(
"/",
verifyToken,
getInvoices
);





// Pending invoices for payment

router.get(
"/pending",
verifyToken,
getPendingInvoices
);





// Single invoice details

router.get(
"/:id",
verifyToken,
getInvoiceById
);





module.exports=router;