import {
	Link,
	useLocation,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import {Bell, Search, ArrowLeft, X, Settings} from "lucide-react";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import examinaWordmark from "@/assets/examina-wordmark.png";

const bellIcon = <Bell className="size-6" />;

export default function DashboardHeader() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const query = searchParams.get("q") ?? "";
	const isSearch = location.pathname === "/dashboard/search";
	const isNotifications = location.pathname === "/dashboard/notifications";

	function updateQuery(value: string) {
		if (value) {
			setSearchParams({q: value});
		} else {
			setSearchParams({});
		}
	}

	return (
		<>
			{isSearch ? (
				<header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
					<div className="flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate(-1)}
							aria-label="Back">
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
			) : isNotifications ? (
				<header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
					<div className="flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate(-1)}
							aria-label="Back">
							<ArrowLeft className="size-6" />
						</Button>
						<h1 className="text-lg font-bold text-text flex-1">
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
			) : (
				<header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
					<div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
						<Button variant="ghost" size="icon" aria-label="Search">
							<Link to="/dashboard/search">
								<Search className="size-6" />
							</Link>
						</Button>

						<div className="flex-1 flex justify-center">
							<Link to="/dashboard">
								<img
									src={examinaWordmark}
									alt="Examina"
									className="h-14 w-auto"
								/>
							</Link>
						</div>

						<Button
							variant="ghost"
							size="icon"
							aria-label="Notifications"
							className="relative flex-shrink-0">
							<Link to="/dashboard/notifications">
								{bellIcon}
								<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
							</Link>
						</Button>
					</div>
				</header>
			)}

			<Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
				<DialogContent className="px-4 py-6">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Settings className="size-5" />
							Notification Settings
						</DialogTitle>
						<DialogDescription className="text-sm">
							Manage your notification preferences
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between">
							<Label className="text-text">Exam notifications</Label>
							<Switch defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<Label className="text-text">Analysis notifications</Label>
							<Switch defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<Label className="text-text">Sheet scan notifications</Label>
							<Switch defaultChecked />
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
