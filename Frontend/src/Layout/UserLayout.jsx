import React from 'react'
import Sidebar from '../assets/Sidebar'
import { Outlet } from 'react-router-dom'
import Footer from '../assets/Footer'

function UserLayout() {
  return (
    <>
      <Sidebar/>
      <Outlet/>
      <Footer/>
    </>
  )
}

export default UserLayout
