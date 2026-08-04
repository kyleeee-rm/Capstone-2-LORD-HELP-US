import {
	Link,
	useLocation,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import {Bell, Search, X, Settings} from "lucide-react";
import {useCallback, useState} from "react";
import {Button} from "@/shared/ui/button";
import {Input} from "@/shared/ui/input";
import {PaginationPrevious} from "@/shared/ui/pagination";
import NotificationSettingsDialog from "./notification-settings-dialog";
import examinaWordmark from "@/assets/examina-wordmark.png";

const bellIcon = <Bell className="size-6" />;

const routeTitles: Record<string, string> = {
	"questions-generation": "Question Generation",
	"sheet-scanning": "Sheet Scanning",
	analysis: "Item Analysis",
	library: "Library",
	menu: "Menu",
};

// Get all route prefixes for generic matching
const routePrefixes = Object.keys(routeTitles);

export default function DashboardHeader() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const query = searchParams.get("q") ?? "";
	const isRoot = location.pathname === "/dashboard";
	const isSearch = location.pathname === "/dashboard/search";
	const isNotifications = location.pathname === "/dashboard/notifications";

	const segments = location.pathname.split("/").filter(Boolean);
	const currentRoute = segments[segments.length - 1] ?? "";

	// Generic prefix matching: check if path starts with any route prefix
	const featureTitle = (() => {
		// First try exact match on the current route
		if (routeTitles[currentRoute]) {
			return routeTitles[currentRoute];
		}
		// Then try prefix matching for nested routes
		for (const prefix of routePrefixes) {
			if (location.pathname.startsWith(`/dashboard/${prefix}`)) {
				return routeTitles[prefix];
			}
		}
		return "";
	})();

	const updateQuery = useCallback(
		(value: string) => {
			if (value) {
				setSearchParams({q: value});
			} else {
				setSearchParams({});
			}
		},
		[setSearchParams],
	);

	if (isSearch) {
		return (
			<>
				<header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
					<div className="flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8">
						<PaginationPrevious text="Back" onClick={() => navigate(-1)} />
						<div className="relative flex-1">
							<label htmlFor="dashboard-search" className="sr-only">
								Search
							</label>
							<Search
								className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
								aria-hidden="true"
							/>
							<Input
								id="dashboard-search"
								type="search"
								placeholder="Search"
								value={query}
								onChange={(e) => updateQuery(e.target.value)}
								className="pl-9 bg-input/50 border-0 rounded-full h-10"
								autoFocus
							/>
						</div>
						{query && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => updateQuery("")}
								aria-label="Clear">
								<X className="size-5" />
							</Button>
						)}
					</div>
				</header>
				<NotificationSettingsDialog
					open={settingsOpen}
					onOpenChange={setSettingsOpen}
				/>
			</>
		);
	}

	if (isNotifications) {
		return (
			<>
				<header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
					<div className="flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8">
						<PaginationPrevious text="Back" onClick={() => navigate(-1)} />
						<h1 className="text-lg font-bold text-foreground flex-1">
							Notifications
						</h1>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Notification settings"
							onClick={() => setSettingsOpen(true)}>
							<Settings className="size-5" />
						</Button>
					</div>
				</header>
				<NotificationSettingsDialog
					open={settingsOpen}
					onOpenChange={setSettingsOpen}
				/>
			</>
		);
	}

	return (
		<>
			<header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
				<div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
					{isRoot ? (
						<Button
							variant="ghost"
							size="icon"
							aria-label="Search"
							onClick={() => navigate("/dashboard/search")}>
							<Search className="size-6" />
						</Button>
					) : (
						<PaginationPrevious text="Back" onClick={() => navigate(-1)} />
					)}

					<div className="flex-1 flex justify-center">
						{isRoot ? (
							<Link to="/dashboard">
								<img
									src={examinaWordmark}
									alt="Examina"
									className="h-14 w-auto"
								/>
							</Link>
						) : featureTitle ? (
							<h1 className="text-lg font-semibold text-foreground md:text-xl">
								{featureTitle}
							</h1>
						) : (
							<Link to="/dashboard">
								<img
									src={examinaWordmark}
									alt="Examina"
									className="h-14 w-auto"
								/>
							</Link>
						)}
					</div>
					<Button
						variant="ghost"
						size="icon"
						aria-label="Notifications"
						className="relative shrink-0"
						onClick={() => navigate("/dashboard/notifications")}>
						{bellIcon}
						<span
							className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
							aria-hidden="true"
						/>
					</Button>
				</div>
			</header>
			<NotificationSettingsDialog
				open={settingsOpen}
				onOpenChange={setSettingsOpen}
			/>
		</>
	);
}
