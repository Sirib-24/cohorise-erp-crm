const express = require("express");
const router = express.Router();
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers
} = require("../controllers/customerController");

router.post(
"/",
verifyToken,
allowRoles("Admin","Sales"),
addCustomer
);


router.get(
"/",
verifyToken,
allowRoles("Admin","Sales"),
getCustomers
);


router.get(
"/search",
verifyToken,
allowRoles("Admin","Sales"),
searchCustomers
);


router.get(
"/:id",
verifyToken,
allowRoles("Admin","Sales"),
getCustomerById
);


router.put(
"/:id",
verifyToken,
allowRoles("Admin","Sales"),
updateCustomer
);


router.delete(
"/:id",
verifyToken,
allowRoles("Admin"),
deleteCustomer
);

module.exports = router;