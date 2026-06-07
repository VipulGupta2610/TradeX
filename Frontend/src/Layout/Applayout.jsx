import React from 'react';
import Navbar from '../assets/Navbar';
import { Outlet } from 'react-router-dom';
import Footer from '../assets/Footer';

const Applayout = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-950 transition-colors duration-300 dark:bg-[#050505] dark:text-white">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Applayout;
