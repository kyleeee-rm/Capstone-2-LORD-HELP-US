import {useId} from "react";
import {useNavigate} from "react-router-dom";
import {useRegister} from "@/features/auth";
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

export default function Register() {
	const navigate = useNavigate();
	const {
		firstName,
		setFirstName,
		lastName,
		setLastName,
		email,
		setEmail,
		password,
		setPassword,
		showPassword,
		setShowPassword,
		errors,
		loading,
		handleSubmit,
		submit,
	} = useRegister();

	const formId = useId();
	const firstNameId = useId();
	const lastNameId = useId();
	const emailId = useId();
	const passwordId = useId();

	return (
		<div className="flex min-h-screen flex-col bg-surface">
			<div className="flex items-center gap-3 border-b border-border px-4 py-3">
				<Button variant="ghost" size="icon-sm" onClick={() => navigate("/")}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-lg font-bold text-text" id="register-title">
					Sign up
				</h1>
			</div>
			<div className="flex flex-1 flex-col px-6 pt-6">
				<div className="mb-2 text-center">
					<p className="text-sm text-text-muted">
						Already have an account?{" "}
						<Button
							variant="link"
							className="p-0"
							onClick={() => navigate("/login")}>
							Sign in
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
					id={formId}
					onSubmit={handleSubmit}
					className="flex flex-col gap-3.5"
					aria-labelledby="register-title">
					<div aria-live="polite">
						{errors.field && (
							<Alert variant="destructive" className="mb-2">
								{errors.field}
							</Alert>
						)}
					</div>
					<Field>
						<FieldLabel htmlFor={firstNameId}>First name</FieldLabel>
						<Input
							id={firstNameId}
							type="text"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor={lastNameId}>Last name</FieldLabel>
						<Input
							id={lastNameId}
							type="text"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor={emailId}>Email address</FieldLabel>
						<Input
							id={emailId}
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor={passwordId}>Password</FieldLabel>
						<InputGroup>
							<InputGroupInput
								id={passwordId}
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<InputGroupAddon align="inline-end">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger
											render={
												<InputGroupButton
													size="icon-xs"
													onClick={() => setShowPassword(!showPassword)}
													aria-label={
														showPassword ? "Hide password" : "Show password"
													}
												/>
											}>
											{showPassword ? (
												<EyeOff className="h-5 w-5" />
											) : (
												<Eye className="h-5 w-5" />
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
									type="submit"
									size="lg"
									className="mt-2 w-full"
									disabled={loading}
								/>
							}>
							{loading ? <Spinner className="size-5" /> : "Create Account"}
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Create your account?</AlertDialogTitle>
								<AlertDialogDescription>
									By creating an account, you agree to our Terms of Service and
									Privacy Policy.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={submit}>Continue</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</form>
			</div>
		</div>
	);
}
