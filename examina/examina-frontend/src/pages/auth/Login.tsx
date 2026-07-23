import { useState } from "react";
import type { FormEvent } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        window.location.href = "/";
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gradient-start via-bg to-gradient-end px-4 py-6 max-[360px]:items-stretch max-[360px]:p-0">
      <div className="w-full max-w-[400px] rounded-xl bg-surface p-10 shadow-md max-[360px]:px-4 max-[360px]:py-6 md:p-12">
        <div className="mb-7 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white max-[360px]:h-10 max-[360px]:w-10 max-[360px]:text-lg">
            E
          </div>
          <h1 className="m-0 mb-1 text-2xl font-bold text-text max-[360px]:text-xl md:text-3xl">
            Examina
          </h1>
          <p className="m-0 text-sm text-text-muted max-[360px]:text-xs md:text-base">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-error-border bg-error-bg px-3.5 py-2.5 text-sm text-error max-[360px]:text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text max-[360px]:text-xs" htmlFor="email">
              Email
            </label>
            <input
              className="rounded-lg border border-border bg-transparent px-3.5 py-2.5 text-base font-[inherit] outline-none transition-colors focus:border-primary max-[360px]:px-3 max-[360px]:py-2 max-[360px]:text-sm"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text max-[360px]:text-xs" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-lg border border-border bg-transparent px-3.5 py-2.5 text-base font-[inherit] outline-none transition-colors focus:border-primary max-[360px]:px-3 max-[360px]:py-2 max-[360px]:text-sm"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="mt-1 cursor-pointer rounded-lg border-none bg-primary px-3 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover max-[360px]:py-2.5 max-[360px]:text-sm"
            type="submit"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
