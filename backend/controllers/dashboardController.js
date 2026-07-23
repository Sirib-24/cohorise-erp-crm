const db = require("../config/db");


const getDashboardStats = (req,res)=>{


const queries = {


customers:
"SELECT COUNT(*) AS count FROM customers",


products:
"SELECT COUNT(*) AS count FROM products",


followups:
`
SELECT COUNT(*) AS count 
FROM customer_followups
WHERE followup_date >= CURDATE()
`,


pendingInvoices:
`
SELECT COUNT(*) AS count
FROM invoices
WHERE status='Pending'
`,


revenue:
`
SELECT SUM(total_amount) AS total
FROM invoices
WHERE status='Paid'
`,


payments:
`
SELECT SUM(amount) AS total
FROM payments
`


};



const result={};


db.query(
queries.customers,
(err,data)=>{


result.customers=data[0].count;



db.query(
queries.products,
(err,data)=>{


result.products=data[0].count;



db.query(
queries.followups,
(err,data)=>{


result.followups=data[0].count;



db.query(
queries.pendingInvoices,
(err,data)=>{


result.pendingInvoices=data[0].count;



db.query(
queries.revenue,
(err,data)=>{


result.revenue=data[0].total || 0;



db.query(
queries.payments,
(err,data)=>{


result.payments=data[0].total || 0;



res.json(result);



});

});


});


});


});


});


};


module.exports={
getDashboardStats
};