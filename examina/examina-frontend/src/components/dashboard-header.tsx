import {Link} from "react-router-dom";
import {Bell, Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import examinaWordmark from "@/assets/examina-wordmark.png";

const searchIcon = <Search className="size-6" />;
const bellIcon = <Bell className="size-6" />;

export default function DashboardHeader() {
	return (
		<header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
			<div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
				<Button variant="ghost" size="icon" aria-label="Search">
					<Link to="/dashboard/search">
						{searchIcon}
					</Link>
				</Button>

				<div className="flex-1 flex justify-center">
					<Link to="/dashboard">
						<img src={examinaWordmark} alt="Examina" className="h-14 w-auto" />
					</Link>
				</div>

				<Button
					variant="ghost"
					size="icon"
					aria-label="Notifications"
					className="relative flex-shrink-0">
					{bellIcon}
					<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
				</Button>
			</div>
		</header>
	);
}
