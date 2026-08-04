import {useId} from "react";
import {Switch} from "@/shared/ui/switch";
import {Label} from "@/shared/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/shared/ui/dialog";
import {Settings} from "lucide-react";

type NotificationSettingsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function NotificationSettingsDialog({
	open,
	onOpenChange,
}: NotificationSettingsDialogProps) {
	const examId = useId();
	const analysisId = useId();
	const sheetScanId = useId();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="px-4 py-6">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Settings className="size-5" aria-hidden="true" />
						Notification Settings
					</DialogTitle>
					<DialogDescription className="text-sm">
						Manage your notification preferences
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<Label htmlFor={examId} className="text-foreground">Exam notifications</Label>
						<Switch id={examId} defaultChecked />
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor={analysisId} className="text-foreground">Analysis notifications</Label>
						<Switch id={analysisId} defaultChecked />
					</div>
					<div className="flex items-center justify-between">
						<Label htmlFor={sheetScanId} className="text-foreground">Sheet scan notifications</Label>
						<Switch id={sheetScanId} />
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
