import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axiosConfig";

function Challans() {

  const [challans, setChallans] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: "",
    product_id: "",
    quantity: "",
    price: ""
  });


  useEffect(() => {
    fetchChallans();
    fetchCustomers();
    fetchProducts();
  }, []);


  // Get all challans
  const fetchChallans = async () => {
    try {
      const res = await api.get("/challans");
      setChallans(res.data);
    }
    catch(err){
      console.error(err);
    }
  };


  // Get customers
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    }
    catch(err){
      console.error(err);
    }
  };


  // Get products
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    }
    catch(err){
      console.error(err);
    }
  };


  // Input changes
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  // Create Challan
  const handleCreateChallan = async () => {


    if(
      !formData.customer_id ||
      !formData.product_id ||
      !formData.quantity ||
      !formData.price
    ){

      alert("Please fill all fields");
      return;

    }


    try {


      const challanData = {

        customer_id:Number(formData.customer_id),

        items:[
          {
            product_id:Number(formData.product_id),
            quantity:Number(formData.quantity),
            price:Number(formData.price)
          }
        ]

      };


      await api.post("/challans", challanData);


      alert("Challan Created Successfully ✅");


      setShowModal(false);


      setFormData({

        customer_id:"",
        product_id:"",
        quantity:"",
        price:""

      });


      fetchChallans();


    }
    catch(err){

      console.error(err);

      if(err.response){

        alert(err.response.data.message);

      }
      else{

        alert("Something went wrong");

      }

    }


  };



  return (

    <div>

      <Navbar />


      <div className="page-container">


        <div className="page-header">

          <h2>Delivery Challans</h2>


          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >

            + Create Challan

          </button>


        </div>



        <table className="data-table">


          <thead>

            <tr>

              <th>Challan No</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total Qty</th>
              <th>Created</th>
              <th>Action</th>

            </tr>


          </thead>



          <tbody>


            {
              challans.length === 0 ?

              (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      textAlign:"center",
                      padding:"20px"
                    }}
                  >

                    No Challans Found

                  </td>


                </tr>

              )


              :


              (

                challans.map((c)=>(

                  <tr key={c.id}>


                    <td>{c.challan_number}</td>

                    <td>{c.customer_name}</td>

                    <td>{c.status}</td>

                    <td>{c.total_quantity}</td>

                    <td>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>


                    <td>

                      <button className="btn-sm btn-edit">
                        View
                      </button>


                    </td>


                  </tr>


                ))

              )

            }


          </tbody>


        </table>


      </div>





      {
        showModal &&

        (

          <div className="modal-overlay">


            <div className="modal-box">


              <h3>Create Delivery Challan</h3>



              <div className="form-group">

                <label>Customer</label>


                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Customer
                  </option>


                  {
                    customers.map((customer)=>(

                      <option
                        key={customer.id}
                        value={customer.id}
                      >

                        {customer.customer_name}

                      </option>

                    ))
                  }


                </select>


              </div>





              <div className="form-group">


                <label>
                  Product
                </label>


                <select

                  name="product_id"

                  value={formData.product_id}

                  onChange={handleChange}

                >


                  <option value="">
                    Select Product
                  </option>



                  {
                    products.map((product)=>(


                      <option

                        key={product.id}

                        value={product.id}

                      >

                        {product.product_name}

                      </option>


                    ))
                  }


                </select>



              </div>






              <div className="form-group">

                <label>
                  Quantity
                </label>


                <input

                  type="number"

                  name="quantity"

                  value={formData.quantity}

                  onChange={handleChange}

                />


              </div>






              <div className="form-group">


                <label>
                  Price
                </label>


                <input

                  type="number"

                  name="price"

                  value={formData.price}

                  onChange={handleChange}

                />


              </div>






              <div className="modal-actions">


                <button

                  className="btn-secondary"

                  onClick={()=>setShowModal(false)}

                >

                  Cancel

                </button>





                <button

                  className="btn-primary"

                  onClick={handleCreateChallan}

                >

                  Create Challan

                </button>


              </div>



            </div>


          </div>


        )

      }



    </div>

  );

}


export default Challans;