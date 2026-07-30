import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Activity = {
  id: string;
  action: "created" | "archived" | "deleted" | "restored" | "uploaded" | "generated";
  type: "subject" | "folder" | "file" | "exam";
  name: string;
  timestamp: number;
};

type ActivityState = {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  clearActivities: () => void;
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      activities: [],
      addActivity: (activity) =>
        set((state) => ({
          activities: [
            { ...activity, id: crypto.randomUUID(), timestamp: Date.now() },
            ...state.activities,
          ].slice(0, 50),
        })),
      clearActivities: () => set({ activities: [] }),
    }),
    { name: "activity-storage" }
  )
);
