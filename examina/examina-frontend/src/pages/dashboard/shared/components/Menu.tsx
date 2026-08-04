import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {LogOut} from "lucide-react";
import {authService} from "@/features/auth";
import {useAuthStore} from "@/shared/stores";
import {Button} from "@/shared/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/shared/ui/item";
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

export default function Menu() {
	const navigate = useNavigate();
	const user = useAuthStore((s) => s.user);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await authService.logout();
		} finally {
			navigate("/login", {replace: true});
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
			<h1 className="font-heading text-2xl font-semibold tracking-tight">Menu</h1>

			<Item variant="outline" size="sm" className="gap-3">
				<ItemMedia variant="icon">
					<span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground uppercase">
						{user?.first_name?.charAt(0) ?? "U"}
						{user?.last_name?.charAt(0) ?? ""}
					</span>
				</ItemMedia>
				<ItemContent>
					<ItemTitle className="text-foreground">
						{user?.first_name} {user?.last_name}
					</ItemTitle>
					<ItemDescription>{user?.email}</ItemDescription>
				</ItemContent>
			</Item>

			<Button
				variant="destructive"
				size="lg"
				className="w-full justify-start"
				onClick={() => setConfirmOpen(true)}
				aria-label="Sign out">
				<LogOut className="size-5" />
				Sign out
			</Button>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogMedia>
							<LogOut className="size-5" />
						</AlertDialogMedia>
						<AlertDialogTitle>Sign out?</AlertDialogTitle>
						<AlertDialogDescription>
							You will be returned to the sign-in screen. You can sign back
							in anytime.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => void handleLogout()}>
							Sign out
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
