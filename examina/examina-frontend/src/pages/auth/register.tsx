import {useId} from "react";
import {Link} from "react-router-dom";
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
		<div className="flex min-h-screen flex-col bg-background">
			<div className="flex items-center gap-3 border-b border-border px-4 py-3">
				<Button
					variant="ghost"
					size="icon-sm"
					render={<Link to="/" />}
					nativeButton={false}
					aria-label="Back to home">
					<ArrowLeft className="size-5" />
				</Button>
				<h1 className="text-lg font-bold text-foreground" id="register-title">
					Sign up
				</h1>
			</div>
			<div className="flex flex-1 flex-col justify-center px-6 py-8 sm:py-12">
				<div className="mx-auto w-full max-w-sm">
					<div className="mb-2 text-center">
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
						noValidate
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
								autoComplete="given-name"
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={lastNameId}>Last name</FieldLabel>
							<Input
								id={lastNameId}
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								autoComplete="family-name"
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={emailId}>Email address</FieldLabel>
							<Input
								id={emailId}
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								autoComplete="email"
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
									autoComplete="new-password"
								/>
								<InputGroupAddon align="inline-end">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger
												render={
													<InputGroupButton
														size="icon-sm"
														onClick={() => setShowPassword(!showPassword)}
														aria-label={
															showPassword ? "Hide password" : "Show password"
														}
													/>
												}>
												{showPassword ? (
													<EyeOff className="size-5" />
												) : (
													<Eye className="size-5" />
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
										aria-busy={loading || undefined}
										aria-label={loading ? "Creating account" : undefined}
									/>
								}>
								<Spinner className={`size-5 ${loading ? "" : "hidden"}`} />
								<span className={loading ? "hidden" : ""}>Create Account</span>
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
									<AlertDialogAction onClick={() => void submit()}>Continue</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</form>
				</div>
			</div>
		</div>
	);
}
