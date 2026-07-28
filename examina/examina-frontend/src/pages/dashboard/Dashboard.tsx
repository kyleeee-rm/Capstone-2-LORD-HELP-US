import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useActivityStore } from "../../store/activityStore";
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
    title: "Sheet Scanning",
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

const actionLabels = {
  created: "Created",
  archived: "Archived",
  deleted: "Deleted",
  restored: "Restored",
  uploaded: "Uploaded",
  generated: "Generated",
};

const typeIcons: Record<string, string> = {
  subject: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  file: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  exam: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activities = useActivityStore((s) => s.activities);
  const name = user?.first_name ?? "User";
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
            <h2 className="relative z-10 w-3/5 text-base font-bold">{mod.title}</h2>
            <img
              src={mod.image}
              alt=""
              className="pointer-events-none absolute right-0 bottom-0 h-full w-2/5 object-contain object-right-bottom"
            />
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-base font-bold text-text">Recent activities</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-text-muted">No recent activities.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[activity.type]} />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text">
                    <span className="font-medium">{actionLabels[activity.action]}</span>{" "}
                    {activity.name}
                  </p>
                  <p className="text-xs text-text-muted">{timeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
