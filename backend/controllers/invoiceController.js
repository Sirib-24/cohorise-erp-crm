const db = require("../config/db");


// Generate invoice number
const generateInvoiceNumber = (callback)=>{

    const date = new Date()
    .toISOString()
    .slice(0,10)
    .replace(/-/g,"");


    const sql =
    "SELECT COUNT(*) AS count FROM invoices WHERE invoice_number LIKE ?";


    db.query(sql,[`INV-${date}-%`],(err,result)=>{

        if(err)
            return callback(err);


        const number =
        (result[0].count+1)
        .toString()
        .padStart(3,"0");


        callback(null,`INV-${date}-${number}`);

    });

};





// Create Invoice from challan

const createInvoice=(req,res)=>{


const {challan_id}=req.body;

const created_by=req.user.id;



db.query(
"SELECT * FROM challans WHERE id=?",
[challan_id],
(err,challan)=>{


if(err)
return res.status(500).json({message:"Server error"});


if(challan.length===0)
return res.status(404).json({message:"Challan not found"});



if(challan[0].status!=="Confirmed")
return res.status(400)
.json({
message:"Only confirmed challans can be invoiced"
});



generateInvoiceNumber((err,invoiceNumber)=>{


if(err)
return res.status(500)
.json({
message:"Invoice generation failed"
});



db.query(

`INSERT INTO invoices
(invoice_number,challan_id,customer_id,total_amount,status,created_by)
VALUES(?,?,?,?,?,?)`,

[
invoiceNumber,
challan_id,
challan[0].customer_id,
0,
"Pending",
created_by
],


(err,result)=>{


if(err)
return res.status(500)
.json({
message:"Insert failed"
});



const invoiceId=result.insertId;



db.query(

"SELECT * FROM challan_items WHERE challan_id=?",
[challan_id],


(err,items)=>{


let total=0;



const values=items.map(item=>{


total += item.quantity * item.price;



return [

invoiceId,
item.product_id,
item.product_name_snapshot,
item.quantity,
item.price

];


});




db.query(

`INSERT INTO invoice_items
(invoice_id,product_id,product_name_snapshot,quantity,price)
VALUES ?`,

[values],


(err)=>{


if(err)

return res.status(500)
.json({
message:"Items failed"
});




db.query(

"UPDATE invoices SET total_amount=? WHERE id=?",

[total,invoiceId],


()=>{


res.json({

message:"Invoice created ✅",
invoiceId,
invoiceNumber

});


});


});


});


});


});


});


};







// Get all invoices

const getInvoices=(req,res)=>{


db.query(

`
SELECT 
i.*,
c.customer_name

FROM invoices i

JOIN customers c

ON i.customer_id=c.id

ORDER BY i.created_at DESC
`,

(err,result)=>{


if(err)

return res.status(500)
.json({
message:"Server error"
});


res.json(result);


});


};







// Get invoice details

const getInvoiceById=(req,res)=>{


const {id}=req.params;



db.query(

"SELECT * FROM invoices WHERE id=?",
[id],


(err,invoice)=>{


if(err)

return res.status(500)
.json({
message:"Error"
});



db.query(

"SELECT * FROM invoice_items WHERE invoice_id=?",
[id],


(err,items)=>{


res.json({

...invoice[0],
items

});


});


});


};







// ⭐ NEW FUNCTION
// Get Pending invoices for Accounts payment

const getPendingInvoices=(req,res)=>{


db.query(

`
SELECT

i.id,
i.invoice_number,
i.total_amount,
i.status,
i.created_at,
c.customer_name


FROM invoices i


JOIN customers c

ON i.customer_id=c.id


WHERE i.status='Pending'


ORDER BY i.created_at DESC

`,


(err,result)=>{


if(err){

console.error(err);


return res.status(500)
.json({
message:"Server error"
});


}



res.json(result);



});


};







module.exports={


createInvoice,
getInvoices,
getInvoiceById,
getPendingInvoices


};