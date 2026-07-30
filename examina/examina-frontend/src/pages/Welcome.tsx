import { useNavigate } from "react-router-dom";
import logo from "../assets/examina-logo.png";
import Button from "../components/ui/Button";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-10 text-center max-[360px]:px-4">
      <div className="flex flex-col items-center">
        <img
          src={logo}
          alt="Examina logo"
          className="mb-6 h-40 w-40 object-contain max-[360px]:mb-2.5 max-[360px]:h-[150px] max-[360px]:w-[150px] md:h-50 md:w-50"
        />
        <h1 className="m-0 mb-2 whitespace-nowrap text-3xl font-bold text-text max-[360px]:text-2xl md:text-4xl">
          Welcome to Examina
        </h1>
        <p className="m-0 mb-8 max-w-[280px] text-sm leading-relaxed text-text-muted max-[360px]:mb-0 max-[360px]:text-xs md:text-base">
          Create an account to start making your assessment workflow simpler.
        </p>
      </div>

      <div className="flex w-full max-w-[400px] flex-col items-center">
        <Button
          size="lg"
          className="w-full max-[360px]:py-3 max-[360px]:text-base"
          onClick={() => navigate("/register")}
        >
          Get Started
        </Button>
        <p className="mt-5 text-sm text-text-muted max-[360px]:text-xs">
          Already have an account?{" "}
          <span
            className="cursor-pointer font-semibold text-primary hover:underline"
            onClick={() => navigate("/login")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
