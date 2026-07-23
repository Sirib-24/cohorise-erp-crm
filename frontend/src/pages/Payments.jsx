import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axiosConfig";


function Payments() {


  const [payments, setPayments] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);


  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);


  const [selectedInvoice, setSelectedInvoice] = useState(null);



  const [manualPayment, setManualPayment] = useState({
    invoice_id:"",
    amount:"",
    payment_method:"UPI",
    payment_date:""
  });



  const [paymentMethod,setPaymentMethod] = useState("UPI");
  const [paymentDate,setPaymentDate] = useState("");





  useEffect(()=>{

    fetchPayments();
    fetchPendingInvoices();

  },[]);





  // Payment History

  const fetchPayments = async()=>{

    try{

      const res = await api.get("/payments");

      setPayments(res.data);

    }
    catch(err){

      console.log(err);

    }

  };





  // Pending invoices

  const fetchPendingInvoices = async()=>{

    try{

      const res = await api.get("/invoices/pending");

      setPendingInvoices(res.data);

    }
    catch(err){

      console.log(err);

    }

  };







  // Manual payment

  const handleManualPayment = async()=>{


    try{


      await api.post("/payments",manualPayment);


      alert("Payment Added ✅");


      setShowAddPayment(false);


      setManualPayment({

        invoice_id:"",
        amount:"",
        payment_method:"UPI",
        payment_date:""

      });



      fetchPayments();
      fetchPendingInvoices();


    }
    catch(err){

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Payment failed"
      );

    }


  };







  // Open pending invoice payment

  const openPayModal=(invoice)=>{


    setSelectedInvoice(invoice);


    setPaymentDate(
      new Date()
      .toISOString()
      .split("T")[0]
    );


    setShowPayModal(true);


  };







  const handleInvoicePayment=async()=>{


    try{


      await api.post("/payments",{

        invoice_id:selectedInvoice.id,

        amount:selectedInvoice.total_amount,

        payment_method:paymentMethod,

        payment_date:paymentDate


      });



      alert("Payment Completed ✅");


      setShowPayModal(false);


      fetchPayments();

      fetchPendingInvoices();



    }
    catch(err){

      console.log(err);


      alert(
        err.response?.data?.message ||
        "Payment failed"
      );


    }


  };







return(

<div>

<Navbar/>


<div className="page-container">



<div className="page-header">

<h2>
Payment Tracking
</h2>


<button

className="btn-primary"

onClick={()=>setShowAddPayment(true)}

>

+ Add Payment

</button>


</div>





{/* PAYMENT HISTORY */}



<h3>
Payment History
</h3>


<table className="data-table">


<thead>

<tr>

<th>Invoice</th>
<th>Customer</th>
<th>Amount</th>
<th>Method</th>
<th>Date</th>

</tr>

</thead>



<tbody>


{

payments.length===0 ?


<tr>

<td colSpan="5"
style={{
textAlign:"center",
padding:"20px"
}}
>

No Payments Found

</td>


</tr>


:


payments.map((p)=>(


<tr key={p.id}>


<td>{p.invoice_number}</td>

<td>{p.customer_name}</td>

<td>₹{p.amount}</td>

<td>{p.payment_method}</td>

<td>{p.payment_date}</td>


</tr>


))


}



</tbody>


</table>








{/* PENDING PAYMENTS */}



<h3 style={{marginTop:"35px"}}>
Pending Payments
</h3>



<table className="data-table">


<thead>

<tr>

<th>Invoice</th>
<th>Customer</th>
<th>Amount</th>
<th>Status</th>
<th>Action</th>


</tr>


</thead>



<tbody>


{

pendingInvoices.length===0 ?


<tr>

<td colSpan="5"
style={{
textAlign:"center",
padding:"20px"
}}
>

No Pending Payments

</td>

</tr>


:


pendingInvoices.map((inv)=>(


<tr key={inv.id}>


<td>{inv.invoice_number}</td>

<td>{inv.customer_name}</td>

<td>₹{inv.total_amount}</td>

<td>{inv.status}</td>


<td>


<button

className="btn-primary"

onClick={()=>openPayModal(inv)}

>

Pay Now

</button>


</td>


</tr>


))


}


</tbody>


</table>






</div>







{/* MANUAL PAYMENT MODAL */}



{

showAddPayment &&


<div className="modal-overlay">


<div className="modal-box">


<h3>
Add Payment
</h3>




<div className="form-group">

<label>
Invoice ID
</label>


<input

value={manualPayment.invoice_id}

onChange={(e)=>

setManualPayment({

...manualPayment,

invoice_id:e.target.value

})

}

/>


</div>





<div className="form-group">

<label>
Amount
</label>


<input

type="number"

value={manualPayment.amount}

onChange={(e)=>

setManualPayment({

...manualPayment,

amount:e.target.value

})

}

/>


</div>





<div className="form-group">

<label>
Payment Method
</label>


<select

value={manualPayment.payment_method}

onChange={(e)=>

setManualPayment({

...manualPayment,

payment_method:e.target.value

})

}

>


<option>UPI</option>

<option>Cash</option>

<option>Bank Transfer</option>

<option>Cheque</option>


</select>


</div>





<div className="form-group">

<label>
Payment Date
</label>


<input

type="date"

value={manualPayment.payment_date}

onChange={(e)=>

setManualPayment({

...manualPayment,

payment_date:e.target.value

})

}

/>


</div>





<div className="modal-actions">


<button

className="btn-secondary"

onClick={()=>setShowAddPayment(false)}

>

Cancel

</button>



<button

className="btn-primary"

onClick={handleManualPayment}

>

Add Payment

</button>


</div>



</div>


</div>


}







{/* PAY NOW MODAL */}




{

showPayModal &&


<div className="modal-overlay">


<div className="modal-box">


<h3>
Complete Payment
</h3>



<p>
Invoice:
<b>{selectedInvoice.invoice_number}</b>
</p>


<p>
Customer:
<b>{selectedInvoice.customer_name}</b>
</p>


<p>
Amount:
<b>₹{selectedInvoice.total_amount}</b>
</p>





<div className="form-group">

<label>
Payment Method
</label>


<select

value={paymentMethod}

onChange={(e)=>setPaymentMethod(e.target.value)}

>


<option>UPI</option>

<option>Cash</option>

<option>Bank Transfer</option>


</select>


</div>





<div className="form-group">

<label>
Payment Date
</label>


<input

type="date"

value={paymentDate}

onChange={(e)=>setPaymentDate(e.target.value)}

>


</input>


</div>




<div className="modal-actions">


<button

className="btn-secondary"

onClick={()=>setShowPayModal(false)}

>

Cancel

</button>



<button

className="btn-primary"

onClick={handleInvoicePayment}

>

Confirm Payment

</button>


</div>



</div>


</div>


}



</div>


);


}


export default Payments;