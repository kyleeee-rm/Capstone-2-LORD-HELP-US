import {Outlet} from "react-router-dom";
import {
	SidebarProvider,
	Sidebar,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import BottomNav from "@/components/bottom-nav";

export default function DashboardLayout() {
	return (
		<SidebarProvider>
			<div className="min-h-screen bg-gray-50">
				<Sidebar>
					<DashboardSidebar />
				</Sidebar>
				<div className="flex-1 min-w-0">
					<DashboardHeader />
					<main className="pt-16 min-h-screen pb-16 md:pb-0 p-4 sm:p-6 lg:p-8">
						<Outlet />
					</main>
				</div>
				<BottomNav />
			</div>
		</SidebarProvider>
	);
}
