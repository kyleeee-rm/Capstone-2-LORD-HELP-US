import {Link, useLocation} from "react-router-dom";
import {Home, Library, Menu} from "lucide-react";
import {Button} from "@/components/ui/button";

const navItems = [
	{name: "Home", href: "/dashboard", icon: Home},
	{name: "Library", href: "/dashboard/library", icon: Library},
	{name: "Menu", href: "/dashboard/menu", icon: Menu},
];

export default function BottomNav() {
	const location = useLocation();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
			<div className="flex items-center justify-around h-16 px-4">
				{navItems.map((item) => (
					<Link
						key={item.name}
						to={item.href}
						className="flex flex-col items-center gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label={item.name}
							className={location.pathname === item.href ? "text-primary" : ""}>
							<item.icon className="size-5" />
						</Button>
						<span
							className={`text-xs font-medium ${location.pathname === item.href ? "text-primary" : "text-gray-500"}`}>
							{item.name}
						</span>
					</Link>
				))}
			</div>
		</nav>
	);
}
