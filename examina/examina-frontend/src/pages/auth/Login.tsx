import {useState} from "react";
import type {FormEvent} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthStore} from "../../store/authStore";
import {authService} from "../../services/authService";
import Button from "../../components/ui/Button";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const login = useAuthStore((s) => s.login);
	const navigate = useNavigate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await authService.login({ email, password });
			login(res.user.email);
			navigate("/dashboard");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Invalid email or password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-surface">
			<div className="flex items-center gap-3 border-b border-border px-4 py-3">
				<button
					onClick={() => navigate("/")}
					className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text transition-colors hover:bg-muted-bg"
					aria-label="Back">
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
				<h1 className="text-lg font-bold text-text">Sign in</h1>
			</div>

			<div className="flex flex-1 flex-col px-6 pt-6">
				<p className="mb-6 text-center text-sm text-text-muted">
					New to Examina?{" "}
					<span
						className="cursor-pointer font-semibold text-primary hover:underline"
						onClick={() => navigate("/register")}>
						Sign up
					</span>
				</p>

				{error && (
					<div className="mb-4 rounded-lg border border-error-border bg-error-bg px-3.5 py-2.5 text-sm text-error">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
					<div>
						<label className="mb-1.5 block text-sm font-medium text-text">Email address</label>
						<input
							className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div>
						<label className="mb-1.5 block text-sm font-medium text-text">Password</label>
						<div className="relative">
							<input
								className="w-full rounded-xl border border-border bg-transparent px-4 py-3 pr-12 text-base text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-1 text-text-muted transition-colors hover:text-text"
								aria-label={showPassword ? "Hide password" : "Show password"}>
								{showPassword ? (
									<svg
										className="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/>
									</svg>
								) : (
									<svg
										className="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								)}
							</button>
						</div>
					</div>

					<p className="text-sm text-primary hover:underline cursor-pointer self-start">
						Forgot Password?
					</p>

					<Button
						type="submit"
						loading={loading}
						size="lg"
						className="mt-2 w-full">
						{loading ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</div>
		</div>
	);
}
