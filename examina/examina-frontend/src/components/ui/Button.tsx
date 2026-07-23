import type {ButtonHTMLAttributes} from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	loading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
	primary:
		"bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md",
	secondary:
		"bg-transparent text-primary border border-primary hover:bg-primary/10",
	ghost: "bg-transparent text-text-muted hover:bg-muted-bg hover:text-text",
	danger: "bg-error text-white hover:bg-error/90",
};

export default function Button({
	variant = "primary",
	loading = false,
	className = "",
	disabled,
	children,
	...props
}: Props) {
	return (
		<button
			className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
			disabled={disabled || loading}
			{...props}>
			{loading && (
				<svg
					className="mr-2 h-4 w-4 animate-spin"
					viewBox="0 0 24 24"
					fill="none">
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
					/>
				</svg>
			)}
			{children}
		</button>
	);
}
