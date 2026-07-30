import { useState, useRef, useEffect } from "react";

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
  prompt: string;
  onSave: (data: {
    hours: number;
    minutes: number;
    blooms: BloomsLevel[];
    prompt: string;
  }) => void;
  onClose: () => void;
}

function ScrollWheel({
  items,
  selected,
  onChange,
}: {
  items: (string | number)[];
  selected: string | number;
  onChange: (val: string | number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const selectedEl = containerRef.current.querySelector(`[data-value="${selected}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [selected]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const center = container.scrollTop + container.clientHeight / 2;
    const children = Array.from(container.children) as HTMLElement[];
    let closest = children[0];
    let minDist = Infinity;
    children.forEach((child) => {
      const dist = Math.abs(child.offsetTop + child.clientHeight / 2 - center);
      if (dist < minDist) {
        minDist = dist;
        closest = child;
      }
    });
    const newVal = closest?.getAttribute("data-value");
    if (newVal !== undefined) {
      onChange(isNaN(Number(newVal)) ? newVal : Number(newVal));
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex h-28 w-20 flex-col items-center overflow-y-auto rounded-xl border border-border bg-surface scrollbar-none"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {items.map((item) => (
        <div
          key={item}
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
      ))}
    </div>
  );
}

export default function EditModal({
  fileName,
  teachingHours,
  teachingMinutes,
  blooms,
  prompt,
  onSave,
  onClose,
}: EditModalProps) {
  const [hours, setHours] = useState(teachingHours);
  const [minutes, setMinutes] = useState(teachingMinutes);
  const [levels, setLevels] = useState(blooms);
  const [promptText, setPromptText] = useState(prompt);

  const totalPercent = levels.reduce((sum, l) => sum + l.value, 0);
  const remaining = 100 - totalPercent;

  const hourOptions = Array.from({ length: 25 }, (_, i) => i);
  const minuteOptions = [0, 15, 30, 45];

  const updateLevel = (index: number, newValue: number) => {
    setLevels((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const otherTotal = prev.reduce((sum, item, j) => (j !== index ? sum + item.value : sum), 0);
        const capped = Math.min(newValue, 100 - otherTotal);
        return { ...l, value: Math.max(0, capped) };
      })
    );
  };

  const handleSave = () => {
    onSave({ hours, minutes, blooms: levels, prompt: promptText });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />

        <h2 className="mb-4 text-center text-lg font-bold text-text">
          Teaching Hours:
        </h2>

        {/* Scroll wheels for hours and minutes */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <ScrollWheel
            items={hourOptions}
            selected={hours}
            onChange={(val) => setHours(Number(val))}
          />
          <span className="text-sm text-text-muted">hour</span>
          <ScrollWheel
            items={minuteOptions}
            selected={minutes}
            onChange={(val) => setMinutes(Number(val))}
          />
          <span className="text-sm text-text-muted">min</span>
        </div>

        {/* Bloom's Level Distribution */}
        <h3 className="mb-3 text-sm font-bold text-text">
          Bloom's level distribution:
        </h3>

        {/* LOTS */}
        <p className="mb-2 text-xs font-bold text-text">LOTS</p>
        <div className="mb-3 flex flex-col gap-2.5">
          {levels.slice(0, 3).map((level, i) => {
            const otherTotal = levels.reduce(
              (sum, l, j) => (j !== i ? sum + l.value : sum),
              0
            );
            const maxAllowed = 100 - otherTotal;
            return (
              <div key={level.name} className="flex items-center gap-3">
                <span className="w-20 text-xs text-text">{level.name}</span>
                <input
                  type="range"
                  min={0}
                  max={maxAllowed}
                  value={level.value}
                  onChange={(e) => updateLevel(i, parseInt(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200"
                  style={{ accentColor: level.color }}
                />
                <span className="w-10 text-right text-xs font-medium text-text">
                  {level.value}%
                </span>
              </div>
            );
          })}
        </div>

        {/* HOTS */}
        <p className="mb-2 text-xs font-bold text-text">HOTS</p>
        <div className="mb-2 flex flex-col gap-2.5">
          {levels.slice(3).map((level, i) => {
            const otherTotal = levels.reduce(
              (sum, l, j) => (j !== i + 3 ? sum + l.value : sum),
              0
            );
            const maxAllowed = 100 - otherTotal;
            return (
              <div key={level.name} className="flex items-center gap-3">
                <span className="w-20 text-xs text-text">{level.name}</span>
                <input
                  type="range"
                  min={0}
                  max={maxAllowed}
                  value={level.value}
                  onChange={(e) => updateLevel(i + 3, parseInt(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200"
                  style={{ accentColor: level.color }}
                />
                <span className="w-10 text-right text-xs font-medium text-text">
                  {level.value}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <p className={`mb-4 text-center text-xs ${totalPercent > 100 ? "text-error" : "text-text-muted"}`}>
          Total: {totalPercent}%{remaining > 0 && ` (Remaining: ${remaining}%)`}
        </p>

        {/* Prompt option */}
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Prompt option"
          className="mb-4 w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-secondary"
        />

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full rounded-full bg-secondary py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
        >
          Save
        </button>
      </div>
    </div>
  );
}
