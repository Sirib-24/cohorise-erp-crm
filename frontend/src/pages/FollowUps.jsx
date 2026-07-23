import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axiosConfig";


function FollowUps(){

const [followups,setFollowups]=useState([]);



useEffect(()=>{
fetchFollowups();
},[]);



const fetchFollowups=async()=>{

try{

const res=await api.get("/followups/pending");

setFollowups(res.data);

}
catch(err){

console.error(err);

}

};


return(

<div>

<Navbar/>


<div className="page-container">


<div className="page-header">

<h2>Upcoming Follow-ups</h2>

</div>



<table className="data-table">


<thead>

<tr>

<th>Customer</th>
<th>Date</th>
<th>Notes</th>
<th>Created By</th>

</tr>

</thead>



<tbody>


{
followups.length===0?


<tr>

<td 
colSpan="4"
style={{textAlign:"center",padding:"20px"}}
>

No Pending Follow-ups

</td>

</tr>


:

followups.map((f)=>(


<tr key={f.id}>


<td>
{f.customer_name}
</td>


<td>
{new Date(f.followup_date).toLocaleDateString()}
</td>


<td>
{f.notes || "-"}
</td>


<td>
{f.created_by_name || "-"}
</td>


</tr>


))

}


</tbody>


</table>


</div>


</div>


)

}


export default FollowUps;