import { useNavigate } from "react-router-dom";
import examinaLogo from "../../assets/examina-logo.png";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
      <div className="flex items-center gap-2">
        <img src={examinaLogo} alt="Examina" className="h-8" />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/dashboard/notifications")}
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-warning transition-colors hover:bg-muted-bg"
          aria-label="Notifications"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C10.9 2 10 2.9 10 4C10 4.1 10 4.19 10.02 4.29C7.12 5.14 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.14 13.98 4.29C14 4.19 14 4.1 14 4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" />
          </svg>
        </button>
        <button
          onClick={() => navigate("/dashboard/search")}
          className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text-muted transition-colors hover:bg-muted-bg hover:text-text"
          aria-label="Search"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
