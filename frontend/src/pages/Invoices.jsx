import {useEffect,useState} from "react";
import Navbar from "../components/Navbar";
import api from "../api/axiosConfig";


function Invoices(){


const [invoices,setInvoices]=useState([]);



useEffect(()=>{

loadInvoices();

},[]);



const loadInvoices=async()=>{

try{

const res=await api.get("/invoices");

setInvoices(res.data);


}
catch(err){

console.log(err);

}

};



return(

<div>

<Navbar/>


<div className="page-container">


<h2>Invoices</h2>


<table className="data-table">


<thead>

<tr>

<th>Invoice No</th>
<th>Customer</th>
<th>Amount</th>
<th>Status</th>
<th>Date</th>

</tr>

</thead>


<tbody>


{

invoices.length===0 ?

<tr>

<td colSpan="5">
No invoices found
</td>

</tr>


:

invoices.map(inv=>(


<tr key={inv.id}>


<td>{inv.invoice_number}</td>

<td>{inv.customer_name}</td>

<td>₹{inv.total_amount}</td>

<td>{inv.status}</td>

<td>
{new Date(inv.created_at)
.toLocaleDateString()}
</td>


</tr>


))


}


</tbody>


</table>


</div>


</div>


);


}


export default Invoices;