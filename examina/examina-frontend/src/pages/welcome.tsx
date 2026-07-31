import {useNavigate} from "react-router-dom";
import {AspectRatio} from "@/shared/ui/aspect-ratio";
import {Button} from "@/shared/ui/button";
import examinaLogo from "@/assets/examina-logo.png";

export default function Welcome() {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-screen flex-col items-center px-6 pt-16 pb-8">
			<AspectRatio ratio={1 / 1} className="w-40 max-w-[200px]">
				<img src={examinaLogo} alt="Examina" className="object-contain" />
			</AspectRatio>

			<h1 className="text-3xl font-bold text-text mb-2">Welcome to Examina</h1>

			<p className="text-sm text-text-muted text-center max-w-xs">
				Create an account to start making your assessment workflow simpler.
			</p>

			<div className="flex-1" />

			<Button
				size="lg"
				className="w-full max-w-sm"
				onClick={() => navigate("/register")}>
				Get Started
			</Button>

			<p className="mt-4 text-sm text-text-muted">
				Already have an account?{" "}
				<Button
					variant="link"
					className="p-0"
					onClick={() => navigate("/login")}>
					Sign in
				</Button>
			</p>
		</div>
	);
}
