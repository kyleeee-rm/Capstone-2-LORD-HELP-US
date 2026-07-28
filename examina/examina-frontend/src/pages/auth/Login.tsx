import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      setAuth(data.user, data.access_token);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || "Invalid email or password");
      } else {
        setError("Cannot connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gradient-start via-bg to-gradient-end px-4 py-6 max-[360px]:items-stretch max-[360px]:p-0">
      <Card className="w-full max-w-[400px] max-[360px]:px-4 max-[360px]:py-6 md:p-12">
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
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            loading={loading}
            className="mt-1 w-full rounded-lg py-3 text-base max-[360px]:py-2.5 max-[360px]:text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
