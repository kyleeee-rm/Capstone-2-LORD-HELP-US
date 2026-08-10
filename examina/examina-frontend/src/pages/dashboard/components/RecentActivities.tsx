import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {formatDistanceToNow} from "date-fns";
import {ChevronRight, FileText, Trash2} from "lucide-react";
import {useActivityStore} from "@/shared/stores";
import type {Activity} from "@/shared/stores";
import {Button} from "@/shared/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
	Item,
	ItemGroup,
	ItemContent,
	ItemTitle,
	ItemDescription,
	ItemActions,
	ItemMedia,
	ItemSeparator,
} from "@/shared/ui/item";
import {toast} from "@/shared/ui/toast";
import {
	ACTIVITY_TYPE_ICONS,
	activityLabel,
	dayGroup,
	type DayGroup,
} from "../dashboard-utils";

const DAY_GROUP_ORDER: DayGroup[] = ["Today", "Yesterday", "Earlier"];

function groupActivities(activities: Activity[]): Record<DayGroup, Activity[]> {
	return activities.reduce<Record<DayGroup, Activity[]>>(
		(groups, activity) => {
			groups[dayGroup(activity.timestamp)].push(activity);
			return groups;
		},
		{Today: [], Yesterday: [], Earlier: []},
	);
}

export default function RecentActivities() {
	const rawActivities = useActivityStore((s) => s.activities);
	const clearActivities = useActivityStore((s) => s.clearActivities);
	const [showAll, setShowAll] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const activities = useMemo(
		() =>
			(Array.isArray(rawActivities) ? rawActivities : []).filter(
				(a) => a && typeof a === "object" && a.id,
			),
		[rawActivities],
	);

	const visible = showAll ? activities : activities.slice(0, 5);
	const groups = useMemo(() => groupActivities(visible), [visible]);
	const hasMore = activities.length > 5;

	const confirmClear = () => {
		clearActivities();
		setConfirmOpen(false);
		toast.add({
			type: "success",
			title: "Activities cleared",
			description: "Your recent activity history has been cleared.",
		});
	};

	return (
		<section className="flex flex-col gap-4" aria-label="Recent Activities">
			<div className="flex items-center justify-between">
				<h2 className="font-heading text-lg font-semibold tracking-tight">
					Recent Activities
				</h2>
				{activities.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setConfirmOpen(true)}
						aria-label="Clear all activities">
						<Trash2 />
						Clear all
					</Button>
				)}
			</div>

			{activities.length === 0 ? (
				<Item variant="muted" size="sm">
					<ItemContent>
						<ItemTitle className="text-muted-foreground justify-center">
							No recent activities
						</ItemTitle>
					</ItemContent>
				</Item>
			) : (
				<ItemGroup className="gap-0">
					{DAY_GROUP_ORDER.filter((day) => groups[day].length > 0).map(
						(day, dayIndex) => (
							<div key={day} className="flex flex-col gap-2">
								<p className="px-1 text-xs font-medium text-muted-foreground">
									{day}
								</p>
								{groups[day].map((activity) => {
									const Icon =
										(activity.type && ACTIVITY_TYPE_ICONS[activity.type]) ||
										FileText;
									const isDeleted = activity.action === "deleted";
									let timeStr = "";
									if (
										activity.timestamp &&
										typeof activity.timestamp === "number" &&
										!isNaN(activity.timestamp)
									) {
										try {
											timeStr = formatDistanceToNow(activity.timestamp, {
												addSuffix: true,
											});
										} catch {
											timeStr = "";
										}
									}
									return (
										<Item
											key={activity.id}
											variant="outline"
											size="sm"
											render={
												activity.href ? <Link to={activity.href} /> : <div />
											}
											className="gap-3">
											<ItemMedia variant="icon">
												<Icon className="size-4 text-muted-foreground" />
											</ItemMedia>
											<ItemContent className="flex-1">
												<ItemTitle
													className={
														isDeleted
															? "text-muted-foreground"
															: "text-foreground"
													}>
													{activity.name}
												</ItemTitle>
												<ItemDescription>
													{activityLabel(activity.action, activity.type)}
												</ItemDescription>
											</ItemContent>
											<ItemActions className="items-center gap-2">
												<p className="text-xs text-muted-foreground whitespace-nowrap">
													{timeStr}
												</p>
												{activity.href && (
													<ChevronRight className="size-4 text-muted-foreground" />
												)}
											</ItemActions>
										</Item>
									);
								})}
								{dayIndex < DAY_GROUP_ORDER.length - 1 && (
									<ItemSeparator className="my-2" />
								)}
							</div>
						),
					)}
				</ItemGroup>
			)}

			{hasMore && (
				<Button
					variant="ghost"
					size="sm"
					className="self-center"
					onClick={() => setShowAll((value) => !value)}>
					{showAll ? "Show less" : `View all (${activities.length})`}
				</Button>
			)}

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia>
							<Trash2 className="size-5" />
						</AlertDialogMedia>
						<AlertDialogTitle>Clear all activities?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove your entire activity history. This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={confirmClear}>
							Clear
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}
