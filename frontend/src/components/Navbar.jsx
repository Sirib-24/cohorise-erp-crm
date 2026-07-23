import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";


function Navbar() {


  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);


  const user = JSON.parse(localStorage.getItem("user"));

  const role = user?.role;



  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

  };



  return (

    <nav className="navbar">
      <button
    className="hamburger"
    onClick={() => setMenuOpen(!menuOpen)}
    >
      ☰
    </button>

    {menuOpen && (
      <div
          className="overlay"
          onClick={() => setMenuOpen(false)}
      ></div>
    )}

    <div className="navbar-brand">
        Cohorise ERP & CRM
    </div>

      <div
        className={
          menuOpen
            ? "navbar-links show"
            : "navbar-links"
        }
      >


      <div className="sidebar-header">
          <button
              className="close-btn"
              onClick={() => setMenuOpen(false)}
          >
              ✕
          </button>
      </div>




        {/* Dashboard */}

        <Link
          to="/dashboard"
          onClick={()=>setMenuOpen(false)}
        >
          Dashboard
        </Link>





        {/* Customers */}

        {
          (role==="Admin" || role==="Sales") &&

          <Link
            to="/customers"
            onClick={()=>setMenuOpen(false)}
          >
            Customers
          </Link>

        }






        {/* Products */}

        {
          (role==="Admin" || role==="Warehouse") &&

          <Link
            to="/products"
            onClick={()=>setMenuOpen(false)}
          >
            Products
          </Link>

        }







        {/* Challans */}

        {
          (role==="Admin" || role==="Sales") &&

          <Link
            to="/challans"
            onClick={()=>setMenuOpen(false)}
          >
            Challans
          </Link>

        }






        {/* Follow Ups */}

        {
          (role==="Admin" || role==="Sales") &&

          <Link
            to="/followups"
            onClick={()=>setMenuOpen(false)}
          >
            Follow-ups
          </Link>

        }







        {/* Invoices */}

        {
          (role==="Admin" || role==="Accounts") &&

          <Link
            to="/invoices"
            onClick={()=>setMenuOpen(false)}
          >
            Invoices
          </Link>

        }






        {/* Payments */}

        {
          (role==="Admin" || role==="Accounts") &&

          <Link
            to="/payments"
            onClick={()=>setMenuOpen(false)}
          >
            Payments
          </Link>

        }





        <span className="navbar-user">

          {
            user 
            ? `${user.name} (${user.role})`
            : ""
          }

        </span>





        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          Logout

        </button>



      </div>



    </nav>

  );

}


export default Navbar;