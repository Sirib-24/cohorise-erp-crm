const db = require("../config/db");


// Add Payment
const addPayment = (req,res)=>{

    const {
        invoice_id,
        amount,
        payment_method,
        payment_date
    } = req.body;


    const created_by = req.user.id;


    if(!invoice_id || !amount){
        return res.status(400).json({
            message:"Invoice and amount are required"
        });
    }



    const sql = `
    INSERT INTO payments
    (invoice_id,amount,payment_method,payment_date,created_by)
    VALUES(?,?,?,?,?)
    `;


    db.query(
        sql,
        [
            invoice_id,
            amount,
            payment_method,
            payment_date,
            created_by
        ],

        (err,result)=>{

            if(err){
                console.error(err);
                return res.status(500)
                .json({message:"Payment failed"});
            }


            // Update invoice status
            db.query(
            `
            UPDATE invoices
            SET status='Paid'
            WHERE id=?
            `,
            [invoice_id],

            ()=>{

                res.status(201).json({
                    message:"Payment added ✅",
                    paymentId:result.insertId
                });

            });


        }
    );


};





// Get all payments

const getPayments=(req,res)=>{


    const sql=`

    SELECT 
    p.*,
    i.invoice_number,
    c.customer_name

    FROM payments p

    JOIN invoices i
    ON p.invoice_id=i.id

    JOIN customers c
    ON i.customer_id=c.id

    ORDER BY p.created_at DESC

    `;



    db.query(sql,(err,result)=>{

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





// Get payments by invoice

const getPaymentsByInvoice=(req,res)=>{


const {invoiceId}=req.params;


db.query(

`
SELECT *
FROM payments
WHERE invoice_id=?
`,

[invoiceId],

(err,result)=>{


if(err){

return res.status(500)
.json({
message:"Server error"
});

}


res.json(result);


}


);


};





module.exports={

addPayment,
getPayments,
getPaymentsByInvoice

};