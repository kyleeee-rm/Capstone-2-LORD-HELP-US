import {useAuthStore} from "@/store/auth-store";
import {useActivityStore} from "@/store/activity-store";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {
	Item,
	ItemGroup,
	ItemContent,
	ItemTitle,
	ItemDescription,
	ItemActions,
	ItemMedia,
} from "@/components/ui/item";
import {Link} from "react-router-dom";
import {formatDistanceToNow} from "date-fns";
import {BookOpenCheck} from "lucide-react";
import questionImg from "@/assets/question.png";
import scanImg from "@/assets/scan.png";
import analyzeImg from "@/assets/analyze.png";

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour >= 5 && hour < 12) return "Good morning";
	if (hour >= 12 && hour < 18) return "Good afternoon";
	return "Good evening";
}

export default function Dashboard() {
	const user = useAuthStore((s) => s.user);
	const activities = useActivityStore((s) => s.activities);

	return (
		<div className="flex flex-col gap-2 pt-4 pb-20">
			<h1 className="font-bold text-text text-nowrap text-[clamp(1.45rem,4vw,1.5rem)]">
				{getGreeting()}, {user?.first_name ?? "User"}!
			</h1>
			<Label className="text-text-muted">
				Your next assessment is just a few clicks away
			</Label>

			<div className="flex flex-col gap-4 pt-2">
				<Button
					asChild
					className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-2xl h-auto shadow-sm pl-6 py-0 pr-0 overflow-hidden">
					<Link
						to="/dashboard/questions"
						className="flex items-center justify-between w-full">
						<span className="text-lg font-semibold">Question Generation</span>
						<img
							src={questionImg}
							alt="Question Generation"
							className="h-22 w-auto object-contain shrink-0"
						/>
					</Link>
				</Button>

				<Button
					asChild
					className="bg-tertiary text-white hover:bg-tertiary/80 rounded-2xl h-auto shadow-sm pl-6 py-0 pr-0 overflow-hidden">
					<Link
						to="/dashboard/sheet-scanning"
						className="flex items-center justify-between w-full">
						<span className="text-lg font-semibold">Sheet Scanning</span>
						<img
							src={scanImg}
							alt="Sheet Scanning"
							className="h-22 w-auto object-contain shrink-0"
						/>
					</Link>
				</Button>

				<Button
					asChild
					className="bg-quaternary text-white hover:bg-quaternary/80 rounded-2xl h-auto shadow-sm pl-6 py-0 pr-0 overflow-hidden">
					<Link
						to="/dashboard/analysis"
						className="flex items-center justify-between w-full">
						<span className="text-lg font-semibold">Item Analysis</span>
						<img
							src={analyzeImg}
							alt="Item Analysis"
							className="h-22 w-auto object-contain shrink-0"
						/>
					</Link>
				</Button>
			</div>
			<h1 className="font-bold text-text text-nowrap text-[clamp(1.25rem,4vw,1.5rem)] pt-2">
				Recent Activities
			</h1>

			{activities.length === 0 ? (
				<Item variant="muted" size="sm">
					<ItemContent>
						<ItemTitle className="text-text-muted justify-center">
							No recent activities
						</ItemTitle>
					</ItemContent>
				</Item>
			) : (
				<ItemGroup>
					{activities.slice(0, 5).map((activity) => (
						<Item
							key={activity.id}
							variant="outline"
							size="sm"
							render={<a href={activity.href} />}
							className="flex items-center justify-center gap-3">
							<ItemContent className="flex-1">
								<ItemTitle className="text-text">{activity.name}</ItemTitle>
								<ItemDescription>
									{activity.action.charAt(0).toUpperCase() +
										activity.action.slice(1)}{" "}
									{activity.type}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Label className="text-xs text-text-muted whitespace-nowrap">
									{formatDistanceToNow(activity.timestamp, {addSuffix: true})}
								</Label>
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			)}
		</div>
	);
}
