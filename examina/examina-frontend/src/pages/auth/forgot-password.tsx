import {useState} from "react";
import {Link} from "react-router-dom";
import {Button} from "@/shared/ui/button";
import {Input} from "@/shared/ui/input";
import {Field, FieldLabel} from "@/shared/ui/field";
import {Alert} from "@/shared/ui/alert";
import {ArrowLeft} from "lucide-react";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) {
			setError("Enter your email address.");
			return;
		}
		setError("");
		setSubmitted(true);
	};

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<div className="flex items-center gap-3 border-b border-border px-4 py-3">
				<Button
					variant="ghost"
					size="icon-sm"
					render={<Link to="/login" />}
					nativeButton={false}
					aria-label="Back to sign in">
					<ArrowLeft className="size-5" />
				</Button>
				<h1
					className="font-heading text-lg font-semibold tracking-tight text-foreground"
					id="forgot-password-title">
					Forgot password
				</h1>
			</div>

			<div className="flex flex-1 flex-col justify-center px-6 py-8 sm:py-12">
				<div className="mx-auto w-full max-w-sm">
					{submitted ? (
						<Alert className="mb-4">
							If an account exists for {email}, a password reset link has been
							sent to it. Please check your inbox.
						</Alert>
					) : (
						<form
							onSubmit={handleSubmit}
							noValidate
							className="flex flex-col gap-3.5"
							aria-labelledby="forgot-password-title">
							<div aria-live="polite">
								{error && <Alert variant="destructive">{error}</Alert>}
							</div>
							<p className="text-sm text-muted-foreground">
								Enter your email address and we'll send you a link to reset
								your password.
							</p>
							<Field>
								<FieldLabel htmlFor="forgot-email">Email address</FieldLabel>
								<Input
									id="forgot-email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									autoComplete="email"
									autoFocus
									required
								/>
							</Field>
							<Button type="submit" size="lg" className="mt-2 w-full">
								Send reset link
							</Button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
