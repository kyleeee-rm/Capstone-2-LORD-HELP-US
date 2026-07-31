import {Link} from "react-router-dom";
import {AspectRatio} from "@/shared/ui/aspect-ratio";
import {Button} from "@/shared/ui/button";
import examinaLogo from "@/assets/examina-logo.png";

export default function Welcome() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10">
			<AspectRatio ratio={1 / 1} className="w-36 max-w-45 sm:w-44 sm:max-w-55">
				<img src={examinaLogo} alt="Examina" className="object-contain" />
			</AspectRatio>

			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
					Welcome to Examina
				</h1>

				<p className="text-sm text-muted-foreground max-w-xs sm:text-base sm:max-w-sm">
					Create an account to start making your assessment workflow simpler.
				</p>
			</div>

			<div className="flex w-full max-w-sm flex-col items-center gap-4">
				<Button
					size="lg"
					render={<Link to="/register" />}
					nativeButton={false}
					className="w-full">
					Get Started
				</Button>

				<p className="text-sm text-muted-foreground">
					Already have an account?{" "}
					<Button
						variant="link"
						render={<Link to="/login" />}
						nativeButton={false}
						className="p-0">
						Sign in
					</Button>
				</p>
			</div>
		</div>
	);
}
