import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Challans from "./pages/Challans";
import FollowUps from "./pages/FollowUps";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";

function App() {

return (

<BrowserRouter>

<Routes>

<Route path="/" element={<Navigate to="/login" />} />

<Route 
path="/login" 
element={<Login />} 
/>


<Route
path="/dashboard"
element={
<ProtectedRoute>
<Dashboard/>
</ProtectedRoute>
}
/>


<Route
path="/customers"
element={
<RoleRoute allowedRoles={["Admin","Sales"]}>
<Customers/>
</RoleRoute>
}
/>


<Route
path="/products"
element={
<RoleRoute allowedRoles={["Admin","Warehouse"]}>
<Products/>
</RoleRoute>
}
/>


<Route
path="/challans"
element={
<RoleRoute allowedRoles={["Admin","Sales"]}>
<Challans/>
</RoleRoute>
}
/>


<Route
path="/followups"
element={
<RoleRoute allowedRoles={["Admin","Sales"]}>
<FollowUps/>
</RoleRoute>
}
/>


<Route
path="/invoices"
element={
<RoleRoute allowedRoles={["Admin","Accounts"]}>
<Invoices/>
</RoleRoute>
}
/>

<Route
path="/payments"
element={
<RoleRoute allowedRoles={["Admin","Accounts"]}>
<Payments/>
</RoleRoute>
}
/>

</Routes>

</BrowserRouter>

);

}

export default App;