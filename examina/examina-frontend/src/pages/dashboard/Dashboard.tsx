import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import examGen from "../../assets/gen-img.png";
import ansScan from "../../assets/check-img.png";
import itemAna from "../../assets/analy-img.png";

const modules = [
  {
    title: "Exam Generation",
    description: "Generate exam questions from your materials",
    path: "/dashboard/questions",
    bg: "bg-secondary",
    image: examGen,
  },
  {
    title: "Answer Sheet Scanner",
    description: "Scan and grade answer sheets automatically",
    path: "/dashboard/materials",
    bg: "bg-tertiary",
    image: ansScan,
  },
  {
    title: "Item Analysis",
    description: "Analyze question performance and difficulty",
    path: "/dashboard/analysis",
    bg: "bg-primary",
    image: itemAna,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const name = user?.split("@")[0] ?? "User";
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">{greeting}, {name}!</h1>
        <p className="text-sm text-text-muted">Your next assessment is just a few clicks away</p>
      </div>

      <div className="flex flex-col gap-4">
        {modules.map((mod) => (
          <button
            key={mod.path}
            onClick={() => navigate(mod.path)}
            className={`relative flex cursor-pointer items-center overflow-hidden rounded-xl px-5 py-7 text-left text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${mod.bg}`}
          >
            <h2 className="relative z-10 w-3/5 text-lg font-bold">{mod.title}</h2>
            <img
              src={mod.image}
              alt=""
              className="pointer-events-none absolute right-0 bottom-0 h-full w-2/5 object-contain object-right-bottom"
            />
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-text">Recent activities</h2>
        <p className="text-sm text-text-muted">No recent activities.</p>
      </div>
    </div>
  );
}
