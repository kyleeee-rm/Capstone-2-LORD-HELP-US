import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProfileDetail() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="pb-20 md:pb-6">
      <button
        onClick={() => navigate("/dashboard/menu")}
        className="mb-2 text-sm text-primary hover:underline"
      >
        &larr; Back to menu
      </button>
      <h1 className="mb-4 text-2xl font-bold text-text">Profile</h1>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">Profile settings coming soon...</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-error bg-error/5 px-4 py-4 text-base font-semibold text-error transition-colors hover:bg-error/10"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
