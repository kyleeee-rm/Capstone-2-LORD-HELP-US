import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

interface FormErrors {
  lastName?: string;
  firstName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function Register() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      await authService.register({
        email,
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      navigate("/login");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setErrors({ general: axiosErr.response?.data?.detail || "Registration failed. Please try again." });
      } else {
        setErrors({ general: "Cannot connect to server" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gradient-start via-bg to-gradient-end px-4 py-6 max-[360px]:items-stretch max-[360px]:p-0">
      <Card className="w-full max-w-[400px] overflow-hidden max-[360px]:px-4 max-[360px]:py-6 md:p-12">
        <div className="mb-7 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white max-[360px]:h-10 max-[360px]:w-10 max-[360px]:text-lg">
            E
          </div>
          <h1 className="m-0 mb-1 text-2xl font-bold text-text max-[360px]:text-xl md:text-3xl">
            Create Account
          </h1>
          <p className="m-0 text-sm text-text-muted max-[360px]:text-xs md:text-base">
            Register as a faculty member
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 rounded-lg border border-error-border bg-error-bg px-3.5 py-2.5 text-sm text-error max-[360px]:text-xs">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              id="firstName"
              type="text"
              placeholder="Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
            />

            <Input
              label="Last Name"
              id="lastName"
              type="text"
              placeholder="Dela Cruz"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
            />
          </div>

          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            loading={loading}
            className="mt-1 w-full rounded-lg py-3 text-base max-[360px]:py-2.5 max-[360px]:text-sm"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-text-muted max-[360px]:text-xs">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="cursor-pointer border-none bg-transparent p-0 font-medium text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </Card>
    </div>
  );
}
