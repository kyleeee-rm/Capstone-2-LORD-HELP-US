import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import BottomNav from "../components/common/BottomNav";

const hideNavbarPaths = ["/dashboard/search", "/dashboard/notifications"];

export default function DashboardLayout() {
  const location = useLocation();
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {showNavbar && <Navbar />}
      <main className="flex-1 px-4 pt-4 pb-20 md:px-6 md:pt-6 md:pb-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
