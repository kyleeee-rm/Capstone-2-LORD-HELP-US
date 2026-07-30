import {Outlet} from "react-router-dom";
import DashboardHeader from "@/components/dashboard-header";
import BottomNav from "@/components/bottom-nav";

export default function DashboardLayout() {
	return (
		<div className="min-h-screen bg-gray-50">
			<DashboardHeader />
			<main className="pt-16 min-h-screen pb-16 md:pb-0 px-4">
				<Outlet />
			</main>
			<BottomNav />
		</div>
	);
}