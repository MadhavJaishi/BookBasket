import React, {useState, useEffect} from 'react'
import Sidebar from '../components/Profile/Sidebar'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from "axios"
import Loader from '../components/Loader/Loader'
import MobileNav from '../components/Profile/MobileNav'

const Profile = () => {
  // const isLoggedIn = useSelector()
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  }
  const [Profile, setProfile] = useState({})
  useEffect(() => { 
    const fetch = async () => {
        const resp = await axios.get("https://thereadingroom-bookstore.onrender.com/api/v1/get-user-info", {headers})
        setProfile(resp.data)
    }
    fetch();
  }, [])
  return (
    <div className='bg-zinc-900 text-white px-2 md:px-12 flex flex-col md:flex-row py-8 gap-4'>
      {!Profile && <div className='w-full h-[100%] flex items-center justify-center'><Loader /></div>}
      {Profile && <>
        <div className='w-full md:w-1/6 h-auto lg:h-screen'>
          <Sidebar data={Profile} />
          <MobileNav />
        </div>
        <div className='w-full md:w-5/6'>
          <Outlet />
        </div>
      </>}
    </div>
  )
}

export default Profile