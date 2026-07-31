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
import {Label} from "@/shared/ui/label";
import {Button} from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { NotificationSettingsDialog } from '@/features/dashboard';
import {MoreVertical, Bell, BellOff, CheckCircle, Trash2, Clock} from "lucide-react";
import {useState} from "react";

const notifications = [
	{
		id: "1",
		title: "Exam Generated",
		description: "Your 'Assessment name' exam is ready to review.",
		time: "5 minutes ago",
	},
	{
		id: "2",
		title: "Item Analysis Ready",
		description:
			"Item analysis for Midterm is ready. View difficulty, discrimination, and distractor performance.",
		time: "1 hour ago",
	},
	{
		id: "3",
		title: "Exam Generated",
		description: "Your 'Midterm' exam is ready to review.",
		time: "2 days ago",
	},
];

export default function Notifications() {
	const [open, setOpen] = useState(false);

	return (
		<div className="flex flex-col gap-4 pt-4 pb-20">
			{notifications.length === 0 ? (
				<Item variant="muted" size="sm">
					<ItemMedia>
						<Bell className="size-5 text-muted-foreground" />
					</ItemMedia>
					<ItemContent>
						<ItemTitle className="text-text-muted justify-center">
							No notifications
						</ItemTitle>
					</ItemContent>
				</Item>
			) : (
				<ItemGroup className="gap-0">
					{notifications.map((n, i) => (
						<div key={n.id}>
							<Item variant="default" size="xs">
								<ItemContent>
									<ItemTitle className="text-text font-semibold">
										{n.title}
									</ItemTitle>
									<ItemDescription>{n.description}</ItemDescription>
									<Label className="text-xs text-text-muted">{n.time}</Label>
								</ItemContent>
								<ItemActions>
									<DropdownMenu>
										<DropdownMenuTrigger
											render={
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label="More options"
												/>
											}>
											<MoreVertical className="size-4" />
										</DropdownMenuTrigger>
										<DropdownMenuContent side="bottom" align="end">
											<DropdownMenuItem>
												<CheckCircle className="size-4" />
												Mark as read
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Clock className="size-4" />
												Remind later
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem>
												<BellOff className="size-4" />
												Mute notifications
											</DropdownMenuItem>
											<DropdownMenuItem variant="destructive">
												<Trash2 className="size-4" />
												Dismiss
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</ItemActions>
							</Item>
							{i < notifications.length - 1 && <ItemSeparator className="my-0" />}
						</div>
					))}
				</ItemGroup>
			)}

			<NotificationSettingsDialog open={open} onOpenChange={setOpen} />
		</div>
	);
}
