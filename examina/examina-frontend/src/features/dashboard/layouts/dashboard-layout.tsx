import {Outlet} from "react-router-dom";
import DashboardHeader from "../components/dashboard-header";
import BottomNav from "../components/bottom-nav";

export default function DashboardLayout() {
	return (
		<div className="flex min-h-screen flex-col">
			<DashboardHeader />
			<main className="flex-1 py-20 px-4 sm:px-6 lg:px-8">
				<Outlet />
			</main>
			<BottomNav />
		</div>
	);
}
