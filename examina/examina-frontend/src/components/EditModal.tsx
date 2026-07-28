import { useState, useRef, useEffect, useCallback } from "react";

interface BloomsLevel {
  name: string;
  value: number;
  color: string;
}

interface EditModalProps {
  fileName: string;
  teachingHours: number;
  teachingMinutes: number;
  blooms: BloomsLevel[];
  onSave: (data: {
    hours: number;
    minutes: number;
    blooms: BloomsLevel[];
  }) => void;
  onClose: () => void;
}

function ScrollWheel({
  items,
  selected,
  onChange,
  label,
}: {
  items: (string | number)[];
  selected: string | number;
  onChange: (val: string | number) => void;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const SPACERS = 3;

  useEffect(() => {
    if (!containerRef.current) return;
    const selectedEl = containerRef.current.querySelector(`[data-value="${selected}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [selected]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const center = container.scrollTop + container.clientHeight / 2;
    const children = Array.from(container.children) as HTMLElement[];
    let closest = children[0];
    let minDist = Infinity;
    children.forEach((child) => {
      const val = child.getAttribute("data-value");
      if (!val || val.startsWith("_spacer")) return;
      const dist = Math.abs(child.offsetTop + child.clientHeight / 2 - center);
      if (dist < minDist) {
        minDist = dist;
        closest = child;
      }
    });
    const newVal = closest?.getAttribute("data-value");
    if (newVal && !newVal.startsWith("_spacer")) {
      onChange(isNaN(Number(newVal)) ? newVal : Number(newVal));
    }
  }, [onChange]);

  const currentIndex = items.indexOf(selected);

  const stepUp = () => {
    if (currentIndex < items.length - 1) onChange(items[currentIndex + 1]);
  };
  const stepDown = () => {
    if (currentIndex > 0) onChange(items[currentIndex - 1]);
  };

  const spacers = Array.from({ length: SPACERS }, (_, i) => `_spacer_${i}`);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={stepDown}
          disabled={currentIndex <= 0}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:bg-muted-bg disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex h-28 w-16 flex-col items-center overflow-y-auto rounded-xl border border-border bg-surface scrollbar-none"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {[...spacers, ...items, ...spacers].map((item, idx) => {
            if (typeof item === "string" && item.startsWith("_spacer")) {
              return <div key={item} className="h-9 w-full flex-shrink-0" />;
            }
            return (
              <div
                key={`${item}-${idx}`}
                data-value={item}
                onClick={() => onChange(item)}
                className={`flex h-9 w-full flex-shrink-0 cursor-pointer items-center justify-center text-center text-sm scroll-snap-align-center transition-colors ${
                  selected === item
                    ? "font-bold text-secondary"
                    : "font-normal text-text-muted"
                }`}
              >
                {item}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={stepUp}
          disabled={currentIndex >= items.length - 1}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:bg-muted-bg disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

export default function EditModal({
  fileName,
  teachingHours,
  teachingMinutes,
  blooms,
  onSave,
  onClose,
}: EditModalProps) {
  const [activeTab, setActiveTab] = useState<"hours" | "blooms">("hours");
  const [hours, setHours] = useState(teachingHours);
  const [minutes, setMinutes] = useState(teachingMinutes);
  const [levels, setLevels] = useState(blooms);

  const totalPercent = levels.reduce((sum, l) => sum + l.value, 0);
  const remaining = 100 - totalPercent;

  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

  const updateLevel = (index: number, delta: number) => {
    setLevels((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const newValue = l.value + delta;
        const otherTotal = prev.reduce((sum, item, j) => (j !== index ? sum + item.value : sum), 0);
        const capped = Math.min(newValue, 100 - otherTotal);
        return { ...l, value: Math.max(0, capped) };
      })
    );
  };

  const handleSave = () => {
    onSave({ hours, minutes, blooms: levels });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-t-2xl bg-surface p-6 shadow-xl sm:rounded-2xl">
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong" />

        <h2 className="mb-4 text-center text-lg font-bold text-text">
          {fileName}
        </h2>

        {/* Tab bar */}
        <div className="mb-5 flex rounded-xl border border-border bg-surface p-1">
          <button
            onClick={() => setActiveTab("hours")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "hours"
                ? "bg-secondary text-white"
                : "text-text-muted hover:text-text"
            }`}
          >
            Teaching Hours
          </button>
          <button
            onClick={() => setActiveTab("blooms")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "blooms"
                ? "bg-secondary text-white"
                : "text-text-muted hover:text-text"
            }`}
          >
            Bloom's Distribution
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "hours" && (
          <div className="flex items-center justify-center gap-5 pb-2">
            <ScrollWheel
              items={hourOptions}
              selected={hours}
              onChange={(val) => setHours(Number(val))}
              label="hour"
            />
            <ScrollWheel
              items={minuteOptions}
              selected={minutes}
              onChange={(val) => setMinutes(Number(val))}
              label="min"
            />
          </div>
        )}

        {activeTab === "blooms" && (
          <div>
            {/* Visual distribution bar */}
            <div className="mb-4 flex h-5 overflow-hidden rounded-full bg-muted-bg">
              {levels.map((level) =>
                level.value > 0 ? (
                  <div
                    key={level.name}
                    className="transition-all duration-200"
                    style={{
                      width: `${level.value}%`,
                      backgroundColor: level.color,
                    }}
                  />
                ) : null
              )}
            </div>

            {/* LOTS */}
            <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-text-muted">LOTS</p>
            <div className="mb-3 flex flex-col gap-2">
              {levels.slice(0, 3).map((level, i) => (
                <div key={level.name} className="flex items-center gap-2.5 rounded-xl bg-muted-bg px-3 py-2.5">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: level.color }} />
                  <span className="flex-1 text-sm font-medium text-text">{level.name}</span>
                  <button
                    type="button"
                    onClick={() => updateLevel(i, -5)}
                    disabled={level.value <= 0}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:bg-border disabled:opacity-30"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-text">{level.value}%</span>
                  <button
                    type="button"
                    onClick={() => updateLevel(i, 5)}
                    disabled={totalPercent >= 100}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:bg-border disabled:opacity-30"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* HOTS */}
            <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-text-muted">HOTS</p>
            <div className="mb-3 flex flex-col gap-2">
              {levels.slice(3).map((level, i) => (
                <div key={level.name} className="flex items-center gap-2.5 rounded-xl bg-muted-bg px-3 py-2.5">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: level.color }} />
                  <span className="flex-1 text-sm font-medium text-text">{level.name}</span>
                  <button
                    type="button"
                    onClick={() => updateLevel(i + 3, -5)}
                    disabled={level.value <= 0}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:bg-border disabled:opacity-30"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-text">{level.value}%</span>
                  <button
                    type="button"
                    onClick={() => updateLevel(i + 3, 5)}
                    disabled={totalPercent >= 100}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:bg-border disabled:opacity-30"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <p className={`mb-2 text-center text-sm ${totalPercent > 100 ? "text-red-500" : totalPercent === 100 ? "text-green-600" : "text-text-muted"}`}>
              Total: {totalPercent}%{remaining > 0 ? ` — ${remaining}% remaining` : totalPercent === 100 ? " — balanced" : ""}
            </p>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          className="mt-4 w-full rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
        >
          Save
        </button>
      </div>
    </div>
  );
}
