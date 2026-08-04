import {Link} from "react-router-dom";
import {Button} from "@/shared/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
			<h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
			<p className="mb-6 text-sm text-muted-foreground">Page not found</p>
			<Button render={<Link to="/dashboard" />} nativeButton={false}>
				Go Home
			</Button>
		</div>
	);
}
