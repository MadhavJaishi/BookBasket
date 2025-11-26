import React, { useEffect, useState } from 'react'
import axios from "axios"
import Loader from '../Loader/Loader'
import { Link } from 'react-router-dom'

const Settings = () => {
  const [Value, setValue] = useState({address: ""});
  const [ProfileData, setProfileData] = useState({});
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  }
  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await axios.get("https://thereadingroom-bookstore.onrender.com/api/v1/get-user-info", {headers});
        console.log(resp);
        setProfileData(resp.data);
        setValue({address: resp.data.address});
      } catch (error) {
        console.error('Error fetching order history:', error.response ? error.response.data : error.message);
      }
    };
    fetch();
  }, [])
  const changeArea = (e) => {
    const {name, value} = e.target;
    setValue({...Value, [name]: value});
  }
  const submitAddress = async () => {
    const response = await axios.put("https://thereadingroom-bookstore.onrender.com/api/v1/update-address", Value, {headers});
    alert(response.data.msg);
  }
  return (
    <>
      {!ProfileData && (
        <div className='w-full h-[100%] flex items-center justify-center'>
          <Loader />
        </div>
      )}
      {ProfileData && (
        <div className='h-[100%] p-0 md:p-4 text-zinc-100'>
          <h1 className='text-3xl md:text-5xl font-semibold text-zinc-500 mb-8'>
            Settings
          </h1>
          <div className='flex flex-col md:flex-row gap-12'>
            <div className='flex flex-col w-full md:w-1/2'>
              <label htmlFor="">Username</label>
              <p className='p-2 rounded bg-zinc-800 mt-2 font-semibold'>
                {ProfileData.username}
              </p>
            </div>
            <div className='flex flex-col w-full md:w-1/2'>
              <label htmlFor="">Email</label>
              <p className='p-2 rounded bg-zinc-800 mt-2 font-semibold'>
                {ProfileData.email}
              </p>
            </div>
          </div>
          <div className='mt-8'>
            <label htmlFor="">Address</label>
            <textarea onChange={changeArea} className='p-2 w-full rounded bg-zinc-800 mt-2 font-semibold' rows="5" placeholder='Address' name="address" value={Value.address} />
          </div>
          <div className='mt-4 flex justify-end'>
            <button onClick={submitAddress} className='bg-yellow-500 text-zinc-900 font-semibold px-3 py-2 rounded hover:bg-yellow-400 transition-all duration-300'>
              Update
            </button>
          </div>
        </div>
      )}

    </>
  )
}

export default Settings