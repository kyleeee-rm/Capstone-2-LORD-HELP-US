import {Link, useLocation} from "react-router-dom";
import {Home, Library, Menu} from "lucide-react";
import {cn} from "@/shared/lib/utils";

const navItems = [
	{name: "Home", href: "/dashboard", icon: <Home className="size-6" />},
	{name: "Library", href: "/dashboard/library", icon: <Library className="size-6" />},
	{name: "Menu", href: "/dashboard/menu", icon: <Menu className="size-6" />},
];

export default function BottomNav() {
	const location = useLocation();

	return (
		<nav aria-label="Main" className="fixed bottom-0 left-0 right-0 z-40 pb-4 bg-surface border-t border-border md:hidden">
			<div className="flex items-center justify-around h-16 px-4">
				{navItems.map((item) => (
					<Link
						key={item.name}
						to={item.href}
						aria-current={location.pathname === item.href ? "page" : undefined}
						className={cn(
							"flex flex-col items-center gap-0 p-2 rounded-xl transition-colors",
							location.pathname === item.href
								? "text-primary"
								: "text-text-muted hover:text-text",
						)}>
						<span aria-hidden="true">{item.icon}</span>
						<span className="text-xs font-medium">{item.name}</span>
					</Link>
				))}
			</div>
		</nav>
	);
}
