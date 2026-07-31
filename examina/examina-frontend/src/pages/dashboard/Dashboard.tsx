import {useAuthStore} from "@/shared/stores";
import {useActivityStore} from "@/shared/stores";
import {Button} from "@/shared/ui/button";
import {
	Item,
	ItemGroup,
	ItemContent,
	ItemTitle,
	ItemDescription,
	ItemActions,
	ItemMedia,
} from "@/shared/ui/item";
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
		<div className="flex flex-col gap-2">
			<h1 className="font-bold text-text text-nowrap text-[clamp(1.45rem,4vw,1.5rem)]">
				{getGreeting()}, {user?.first_name ?? "User"}!
			</h1>
			<p className="text-sm text-text-muted">
				Your next assessment is just a few clicks away
			</p>

			<div className="flex flex-col gap-4 pt-2">
				<Button
					render={<Link to="/dashboard/questions-generation" />}
					nativeButton={false}
					className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-2xl h-auto shadow-sm pl-6 py-0 pr-0 overflow-hidden justify-start">
					<span className="text-lg font-semibold">Question Generation</span>
					<img
						src={questionImg}
						alt=""
						aria-hidden="true"
						className="h-22 w-auto object-contain shrink-0 ml-auto"
					/>
				</Button>

				<Button
					render={<Link to="/dashboard/sheet-scanning" />}
					nativeButton={false}
					className="bg-tertiary text-white hover:bg-tertiary/80 rounded-2xl h-auto shadow-sm pl-6 py-0 pr-0 overflow-hidden justify-start">
					<span className="text-lg font-semibold">Sheet Scanning</span>
					<img
						src={scanImg}
						alt=""
						aria-hidden="true"
						className="h-22 w-auto object-contain shrink-0 ml-auto"
					/>
				</Button>

				<Button
					render={<Link to="/dashboard/analysis" />}
					nativeButton={false}
					className="bg-quaternary text-white hover:bg-quaternary/80 rounded-2xl h-auto shadow-sm pl-6 py-0 pr-0 overflow-hidden justify-start">
					<span className="text-lg font-semibold">Item Analysis</span>
					<img
						src={analyzeImg}
						alt=""
						aria-hidden="true"
						className="h-22 w-auto object-contain shrink-0 ml-auto"
					/>
				</Button>
			</div>
			<h2 className="font-bold text-text text-nowrap text-[clamp(1.25rem,4vw,1.5rem)] pt-2">
				Recent Activities
			</h2>

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
							render={activity.href ? <a href={activity.href} /> : <div />}
							className="flex items-center justify-center gap-3 ">
							<ItemContent className="flex-1">
								<ItemTitle className="text-text">{activity.name}</ItemTitle>
								<ItemDescription>
									{activity.action.charAt(0).toUpperCase() +
										activity.action.slice(1)}{" "}
									{activity.type}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<p className="text-xs text-text-muted whitespace-nowrap">
									{formatDistanceToNow(activity.timestamp, {addSuffix: true})}
								</p>
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			)}
		</div>
	);
}
