import {format} from "date-fns";
import {Link} from "react-router-dom";
import {useAuthStore} from "@/shared/stores";
import {Button} from "@/shared/ui/button";
import {getGreeting} from "./dashboard-utils";
import RecentActivities from "./components/RecentActivities";
import questionImg from "@/assets/question.png";
import scanImg from "@/assets/scan.png";
import analyzeImg from "@/assets/analyze.png";

const FEATURES = [
	{
		to: "/dashboard/questions-generation",
		title: "Question Generation",
		image: questionImg,
		className: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
	},
	{
		to: "/dashboard/sheet-scanning",
		title: "Sheet Scanning",
		image: scanImg,
		className: "bg-tertiary text-white hover:bg-tertiary/80",
	},
	{
		to: "/dashboard/analysis",
		title: "Item Analysis",
		image: analyzeImg,
		className: "bg-quaternary text-white hover:bg-quaternary/80",
	},
] as const;

export default function Dashboard() {
	const user = useAuthStore((s) => s.user);

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-1">
			<div className="flex flex-col gap-1">
				<h1 className="font-heading text-2xl font-semibold tracking-tight">
					{getGreeting()}, {user?.first_name ?? "User"}!
				</h1>
				<p className="text-sm text-muted-foreground">
					{format(new Date(), "EEEE, MMMM d")} · Your next assessment is just a
					few clicks away
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{FEATURES.map((feature) => (
					<Button
						key={feature.to}
						render={<Link to={feature.to} />}
						nativeButton={false}
						aria-label={`Open ${feature.title}`}
						className={`${feature.className} w-full rounded-2xl h-auto min-h-20 md:min-h-36 shadow-sm pl-5 sm:pl-6 pr-0 overflow-hidden`}>
						<span className="min-w-0 flex-1 text-base sm:text-lg lg:text-xl font-semibold text-left leading-snug">
							{feature.title}
						</span>
						<img
							src={feature.image}
							alt=""
							aria-hidden="true"
							className="h-full w-24 sm:w-32 md:w-full md:max-w-52 shrink-0 self-stretch object-cover"
						/>
					</Button>
				))}
			</div>

			<RecentActivities />
		</div>
	);
}
