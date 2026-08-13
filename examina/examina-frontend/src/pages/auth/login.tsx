import {useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useLogin} from "@/features/auth";
import {Button} from "@/shared/ui/button";
import {Input} from "@/shared/ui/input";
import {Alert} from "@/shared/ui/alert";
import {Field, FieldLabel} from "@/shared/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/shared/ui/input-group";
import {Spinner} from "@/shared/ui/spinner";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/shared/ui/tooltip";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/shared/ui/alert-dialog";
import {Eye, EyeOff, ArrowLeft} from "lucide-react";

export default function Login() {
	const navigate = useNavigate();
	const {
		email,
		setEmail,
		password,
		setPassword,
		showPassword,
		setShowPassword,
		errors,
		loading,
		handleSubmit,
	} = useLogin();

	const goToHome = useCallback(() => navigate("/"), [navigate]);
	const goToRegister = useCallback(() => navigate("/register"), [navigate]);
	const goToForgotPassword = useCallback(
		() => navigate("/forgot-password"),
		[navigate],
	);
	const togglePassword = useCallback(
		() => setShowPassword((p) => !p),
		[setShowPassword],
	);

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<div className="flex items-center gap-1 border-b border-border px-2 py-2">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={goToHome}
					aria-label="Back to home">
					<ArrowLeft className="size-4" />
				</Button>
				<h1 className="text-base font-bold text-foreground" id="login-title">
					Sign in
				</h1>
			</div>

			<div className="flex flex-1 flex-col justify-top px-2 py-2">
				<div className="mx-auto w-full max-w-sm">
					<div className="mb-2 text-center">
						<p className="text-sm text-muted-foreground">
							New to Examina?{" "}
							<Button
								variant="link"
								className="p-0 text-sm"
								onClick={goToRegister}>
								Sign up
							</Button>
						</p>
					</div>

					<div aria-live="polite">
						{errors.server && (
							<Alert variant="destructive" className="mb-4">
								{errors.server}
							</Alert>
						)}
					</div>

					<form
						onSubmit={handleSubmit}
						noValidate
						className="flex flex-col gap-1"
						aria-labelledby="login-title">
						<div aria-live="polite">
							{errors.field && (
								<Alert variant="destructive">{errors.field}</Alert>
							)}
						</div>

						<Field>
							<FieldLabel htmlFor="login-email">Email address</FieldLabel>
							<Input
								id="login-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								autoComplete="email"
								required
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="login-password">Password</FieldLabel>
							<InputGroup>
								<InputGroupInput
									id="login-password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="current-password"
									required
								/>
								<InputGroupAddon align="inline-end">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger
												render={
													<InputGroupButton
														type="button"
														size="icon-sm"
														onClick={togglePassword}
														aria-label={
															showPassword ? "Hide password" : "Show password"
														}
													/>
												}>
												{showPassword ? (
													<EyeOff className="size-4" />
												) : (
													<Eye className="size-4" />
												)}
											</TooltipTrigger>
											<TooltipContent>
												{showPassword ? "Hide password" : "Show password"}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</InputGroupAddon>
							</InputGroup>
						</Field>

						<AlertDialog>
							<AlertDialogTrigger
								render={
									<Button
										variant="link"
										className="self-start p-0 text-sm"
										type="button"
									/>
								}>
								Forgot Password?
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Reset your password</AlertDialogTitle>
									<AlertDialogDescription>
										Enter your email address and we'll send you a link to reset
										your password.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={goToForgotPassword}>
										Continue
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>

						<Button
							type="submit"
							size="lg"
							className="mt-2 w-full"
							disabled={loading}
							aria-busy={loading || undefined}
							aria-label={loading ? "Signing in" : undefined}>
							<Spinner className={`size-5 ${loading ? "" : "hidden"}`} />
							<span className={loading ? "hidden" : ""}>Sign in</span>
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
