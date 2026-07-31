import {useNavigate} from "react-router-dom";
import {Button} from "@/shared/ui/button";

export default function NotFound() {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
			<h1 className="mb-2 text-6xl font-bold text-text">404</h1>
			<p className="mb-6 text-sm text-text-muted">Page not found</p>
			<Button onClick={() => navigate("/dashboard")}>Go Home</Button>
		</div>
	);
}
