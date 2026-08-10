export function parseApiError(
	err: unknown,
	fallback = "Something went wrong",
): string {
	if (err && typeof err === "object" && "response" in err) {
		const axiosErr = err as {
			response?: {data?: {message?: string; detail?: string}};
		};
		return (
			axiosErr.response?.data?.message ||
			axiosErr.response?.data?.detail ||
			fallback
		);
	}
	return "Cannot connect to server";
}
