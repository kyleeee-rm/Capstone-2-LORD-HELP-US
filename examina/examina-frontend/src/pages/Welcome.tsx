import { useNavigate } from "react-router-dom";
import logo from "../assets/examina-logo.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-10 py-10 max-[360px]:items-stretch max-[360px]:p-0">
      <div className="flex w-full max-w-[400px] flex-col items-center px-6 py-10 text-center max-[360px]:min-h-screen max-[360px]:justify-between max-[360px]:px-4 max-[360px]:py-12">
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="Examina logo"
            className="mb-6 h-40 w-40 object-contain max-[360px]:mb-2.5 max-[360px]:h-[150px] max-[360px]:w-[150px] md:h-50 md:w-50"
          />
          <h1 className="m-0 mb-2 text-3xl font-bold text-text max-[360px]:text-2xl md:text-4xl">
            Welcome to Examina
          </h1>
          <p className="m-0 mb-8 max-w-[280px] text-sm leading-relaxed text-text-muted max-[360px]:mb-0 max-[360px]:text-xs md:text-base">
            Create an account to start making your assessment workflow simpler.
          </p>
        </div>

        <div className="flex w-full flex-col items-center">
          <button
            className="w-full cursor-pointer rounded-full border-none bg-primary py-3.5 text-base font-semibold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_4px_14px_rgba(37,99,235,0.45)] max-[360px]:py-3 max-[360px]:text-sm"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
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
    </div>
  );
}
