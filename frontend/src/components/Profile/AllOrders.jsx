import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import Loader from '../Loader/Loader';
import { FaUserLarge } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { IoOpenOutline } from "react-icons/io5";
import SeeUserData from '../../pages/SeeUserData';

const AllOrders = () => {
  const [AllOrders, setAllOrders] = useState([]);
  const [Options, setOptions] = useState(-1);
  const [Values, setValues] = useState({ status: "" });
  const [UserDiv, setUserDiv] = useState("hidden");
  const [UserDivData, setUserDivData] = useState("");;

  const headers = {
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  }

  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get("https://thereadingroom-bookstore.onrender.com/api/v1/get-all-orders", { headers });
      setAllOrders(response.data.data);
    }
    fetch();
  }, []); // Empty dependency array so the effect runs only once on component mount

  const change = (e) => {
    const { value } = e.target;
    setValues({ status: value });
  }

  const submitChanges = async (i) => {
    const id = AllOrders[i]._id;
    const response = await axios.put(`https://thereadingroom-bookstore.onrender.com/api/v1/update-status/${id}`, Values, { headers });
    alert(response.data.msg);
  }

  return (
    <>
      {!AllOrders.length && <div className='h-[100%] flex items-center justify-center'>
        <Loader />
      </div>}

      {AllOrders.length > 0 && (
        <div className='h-[100%] p-0 md:p-4 text-zinc-100'>
          <h1 className='text-3xl md:text-5xl font-semibold text-zinc-500 mb-8'>All Orders</h1>

          {/* Header */}
          <div className='mt-4 bg-zinc-800 w-full rounded py-2 px-4 flex gap-2'>
            <div className='w-[5%]'>
              <h1 className='text-center'>Sr.</h1>
            </div>
            <div className='w-[35%] md:w-[22%]'>
              <h1>Books</h1>
            </div>
            <div className='w-0 md:w-[40%] hidden md:block'>
              <h1>Description</h1>
            </div>
            <div className='w-[20%] md:w-[10%] flex items-center justify-end'>
              <h1>Price</h1>
            </div>
            <div className='w-[20%] md:w-[15%] flex items-center justify-center'>
              <h1>Status</h1>
            </div>
            <div className='w-[10%] md:w-[8%] flex items-center justify-center'>
              <h1 className='text-center ms-5'>
                <FaUserLarge />
              </h1>
            </div>
          </div>

          {/* Data Rows */}
          {AllOrders.map((items, i) => (
            // Safely check for item existence
            items && items.book && (
              <div key={i} className='bg-zinc-800 w-full rounded py-2 px-4 flex gap-2 hover:bg-zinc-900 hover:cursor-pointer'>
                <div className='w-[5%]'>
                  <h1 className='text-center'>{i + 1}</h1>
                </div>
                <div className='w-[35%] md:w-[22%]'>
                  <Link className="hover:text-blue-300" to={`/view-book-details/${items.book._id}`}>
                    {items.book.title}
                  </Link>
                </div>
                <div className='w-0 md:w-[40%] hidden md:block'>
                  <h1>{items.book.desc.slice(0, 50)} ...</h1>
                </div>
                <div className='w-[20%] md:w-[10%] flex justify-center'>
                  <h1>{items.book.price}</h1>
                </div>
                <div className='w-[20%] md:w-[15%] relative overflow-visible'>
                  <h1 className='font-semibold'>
                    <button onClick={() => setOptions(Options === i ? -1 : i)} className='hover:scale-105 transition-all duration-300'>
                      {items.status === "Order placed" ? (
                        <div className='text-yellow-500'>{items.status}</div>
                      ) : items.status === "Cancelled" ? (
                        <div className='text-red-500'>{items.status}</div>
                      ) : (
                        <div className='text-green-500'>{items.status}</div>
                      )}
                    </button>

                    {/* Dropdown menu */}
                    <div className={`${Options === i ? "flex" : "hidden"} mt-4 absolute`}>
                      <select className='bg-gray-800' name="status" value={Values.status} onChange={change}>
                        {["Order placed", "Out for delivery", "Delivered", "Cancelled"].map((item, index) => (
                          <option value={item} key={index}>{item}</option>
                        ))}
                      </select>
                      <button className='text-green-500 hover:text-pink-600 mx-2' onClick={() => {
                        setOptions(-1);
                        submitChanges(i);
                      }}><FaCheck /></button>
                    </div>
                  </h1>
                </div>
                <div className='w-[10%] md:w-[5%] text-center'>
                  <button onClick={() => {
                    setUserDiv("fixed");
                    setUserDivData(items.user);
                  }} className='text-xl hover:text-orange-500'>
                    <IoOpenOutline />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {UserDivData && (
        <SeeUserData UserDivData={UserDivData} UserDiv={UserDiv} setUserDiv={setUserDiv} />
      )}
    </>
  )
}

export default AllOrders;
