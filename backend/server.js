const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const customerRoutes = require("./routes/customerRoutes");
const followupRoutes = require("./routes/followupRoutes");
const productRoutes = require("./routes/productRoutes");
const challanRoutes = require("./routes/challanRoutes");
const invoiceRoutes=require("./routes/invoiceRoutes");
const paymentRoutes=require("./routes/paymentRoutes");


const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/products", productRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/invoices",invoiceRoutes);
app.use("/api/payments",paymentRoutes);



//Test Route
app.get("/", (req, res) => {
    res.send("Mini ERP + CRM Backend is Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});