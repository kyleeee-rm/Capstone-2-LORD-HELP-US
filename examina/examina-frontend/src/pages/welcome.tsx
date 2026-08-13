import {Link} from "react-router-dom";
import {AspectRatio} from "@/shared/ui/aspect-ratio";
import {Button} from "@/shared/ui/button";
import examinaLogo from "@/assets/examina-logo.png";

export default function Welcome() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-1 px-2">
			<AspectRatio ratio={1 / 1} className="w-36 max-w-45 sm:w-44 sm:max-w-55">
				<img src={examinaLogo} alt="Examina" className="object-contain" />
			</AspectRatio>

			<div className="flex flex-col items-center gap-1 text-center">
				<h1 className="font-bold text-2xl">Welcome to Examina</h1>

				<p className="text-muted-foreground text-base max-w-sm">
					Create an account to start making your assessment workflow simpler.
				</p>
			</div>

			<div className="flex w-full max-w-sm flex-col items-center gap-1">
				<Button
					size="lg"
					render={<Link to="/register" />}
					nativeButton={false}
					className="mt-4 w-full">
					Get Started
				</Button>

				<p className="text-sm text-muted-foreground">
					Already have an account?{" "}
					<Button
						variant="link"
						render={<Link to="/login" />}
						nativeButton={false}
						className="p-0 text-sm">
						Sign in
					</Button>
				</p>
			</div>
		</div>
	);
}
