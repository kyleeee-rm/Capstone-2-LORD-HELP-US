import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

const menuItems = [
  { label: "Assessment Library", path: "/dashboard/library" },
  { label: "Analysis Reports", path: "/dashboard/reports" },
  { label: "Preferences", path: "/dashboard/settings" },
  { label: "Help Center", path: "/dashboard/help" },
];

export default function Sidebar({ open, onClose }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-end px-4 py-3">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-text-muted transition-colors hover:bg-muted-bg hover:text-text"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="mb-1 w-full cursor-pointer rounded-lg border-none bg-transparent px-4 py-3 text-left text-base font-medium text-text transition-colors hover:bg-muted-bg"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4">
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer rounded-full border-2 border-primary bg-transparent px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
