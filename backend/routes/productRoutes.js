const express = require("express");
const router = express.Router();
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  getLowStockProducts,
  addStockMovement,
  getStockMovements,
  deleteProduct
} = require("../controllers/productController");

router.post(
"/",
verifyToken,
allowRoles("Admin","Warehouse"),
addProduct
);


router.get(
"/",
verifyToken,
allowRoles("Admin","Warehouse"),
getProducts
);


router.get(
"/low-stock",
verifyToken,
allowRoles("Admin","Warehouse"),
getLowStockProducts
);


router.get(
"/:id",
verifyToken,
allowRoles("Admin","Warehouse"),
getProductById
);


router.put(
"/:id",
verifyToken,
allowRoles("Admin","Warehouse"),
updateProduct
);


router.post(
"/stock-movement",
verifyToken,
allowRoles("Admin","Warehouse"),
addStockMovement
);


router.get(
"/:productId/movements",
verifyToken,
allowRoles("Admin","Warehouse"),
getStockMovements
);

router.post("/stock-movement", verifyToken, addStockMovement);
router.get("/:productId/movements", verifyToken, getStockMovements);


module.exports = router;