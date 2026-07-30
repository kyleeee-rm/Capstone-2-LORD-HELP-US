import {Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {Bell, Search, ArrowLeft, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import examinaWordmark from "@/assets/examina-wordmark.png";

const bellIcon = <Bell className="size-6" />;

export default function DashboardHeader() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const query = searchParams.get("q") ?? "";
	const isSearch = location.pathname === "/dashboard/search";

	function updateQuery(value: string) {
		if (value) {
			setSearchParams({q: value});
		} else {
			setSearchParams({});
		}
	}

	if (isSearch) {
		return (
			<header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
				<div className="flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8">
					<Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
						<ArrowLeft className="size-6" />
					</Button>
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search"
							value={query}
							onChange={(e) => updateQuery(e.target.value)}
							className="pl-9 bg-input/50 border-0 rounded-full h-10"
							autoFocus
						/>
					</div>
					{query && (
						<Button variant="ghost" size="icon" onClick={() => updateQuery("")} aria-label="Clear">
							<X className="size-5" />
						</Button>
					)}
				</div>
			</header>
		);
	}

	return (
		<header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
			<div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
				<Button variant="ghost" size="icon" aria-label="Search">
					<Link to="/dashboard/search">
						<Search className="size-6" />
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