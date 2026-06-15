import Navbar from '../assets/Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../assets/Footer';

const Applayout = () => {
  const { pathname } = useLocation();
  const usesMarketingShell = ['/', '/Login', '/Signup'].includes(pathname);

  return (
    <div className="min-h-screen bg-white text-zinc-950 transition-colors duration-300 dark:bg-[#050505] dark:text-white">
      {usesMarketingShell && <Navbar />}
      <Outlet />
      { <Footer />}
    </div>
  );
}

export default Applayout;
