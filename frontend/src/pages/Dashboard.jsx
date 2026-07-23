import {useEffect,useState} from "react";
import Navbar from "../components/Navbar";
import api from "../api/axiosConfig";


function Dashboard(){


const [stats,setStats]=useState({});


const user = JSON.parse(localStorage.getItem("user"));
const role = user?.role;



useEffect(()=>{

loadStats();

},[]);




const loadStats=async()=>{


try{

const res=await api.get("/dashboard/stats");

setStats(res.data);


}

catch(err){

console.log(err);

}


};






return(

<div>

<Navbar/>


<div className="page-container">


<h2>
Dashboard
</h2>

<div className="dashboard-grid">

{/* ADMIN */}

{

role==="Admin" &&

<>


<Card
title="Customers"
value={stats.customers}
/>


<Card
title="Products"
value={stats.products}
/>


<Card
title="Pending Follow-ups"
value={stats.followups}
/>


<Card
title="Pending Invoices"
value={stats.pendingInvoices}
/>


<Card
title="Revenue"
value={`₹${stats.revenue}`}
/>


<Card
title="Payments Received"
value={`₹${stats.payments}`}
/>


</>

}

{/* SALES */}


{

role==="Sales" &&

<>


<Card
title="Customers"
value={stats.customers}
/>


<Card
title="Pending Follow-ups"
value={stats.followups}
/>


<Card
title="Challans"
value="Available"
/>


</>

}







{/* WAREHOUSE */}


{

role==="Warehouse" &&

<>


<Card
title="Products"
value={stats.products}
/>


<Card
title="Inventory Status"
value="Active"
/>


<Card
title="Challans"
value="Available"
/>


</>

}







{/* ACCOUNTS */}


{

role==="Accounts" &&

<>

<Card
title="Pending Invoices"
value={stats.pendingInvoices}
/>

<Card
title="Revenue"
value={`₹${stats.revenue}`}
/>

<Card
title="Payments Received"
value={`₹${stats.payments}`}
/>
</>

}

</div>
</div>
</div>

);


}


function Card({title,value}){


return(

<div className="dashboard-card">
<h4>
{title}
</h4>

<h2>
{value || 0}
</h2>
</div>

);

}



export default Dashboard;