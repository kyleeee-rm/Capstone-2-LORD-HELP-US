import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";

export default function NotFound() {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
			<h1 className="mb-2 text-6xl font-bold text-text">404</h1>
			<Label className="mb-6 text-text-muted font-normal">Page not found</Label>
			<Button onClick={() => navigate("/dashboard")}>Go Home</Button>
		</div>
	);
}
