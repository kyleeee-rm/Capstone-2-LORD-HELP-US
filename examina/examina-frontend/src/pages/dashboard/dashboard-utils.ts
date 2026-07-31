import {isToday, isYesterday} from "date-fns";
import {BookOpenCheck, ClipboardList, FileText, Folder} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import type {Activity} from "@/shared/stores";

export function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour >= 5 && hour < 12) return "Good morning";
	if (hour >= 12 && hour < 18) return "Good afternoon";
	return "Good evening";
}

export function getInitials(firstName?: string, lastName?: string): string {
	return `${firstName?.charAt(0) ?? "U"}${lastName?.charAt(0) ?? ""}`.toUpperCase();
}

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export function activityLabel(action: Activity["action"], type: Activity["type"]): string {
	return `${capitalize(action)} a ${type}`;
}

export const ACTIVITY_TYPE_ICONS: Record<Activity["type"], LucideIcon> = {
	subject: BookOpenCheck,
	folder: Folder,
	file: FileText,
	exam: ClipboardList,
};

export const ACTIVITY_TYPE_LABELS: Record<Activity["type"], string> = {
	subject: "Subject",
	folder: "Folder",
	file: "File",
	exam: "Exam",
};

export type DayGroup = "Today" | "Yesterday" | "Earlier";

export function dayGroup(timestamp: number): DayGroup {
	if (isToday(timestamp)) return "Today";
	if (isYesterday(timestamp)) return "Yesterday";
	return "Earlier";
}
