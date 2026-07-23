import { useState, useRef, useEffect } from "react";

type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

type Props = {
  items: MenuItem[];
};

export default function KebabMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-lg border-none bg-transparent p-1 text-text-muted transition-colors hover:bg-muted-bg hover:text-text"
        aria-label="More options"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl bg-surface shadow-lg">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-3 border-none bg-transparent px-4 py-3 text-left text-sm font-medium text-text transition-colors hover:bg-muted-bg"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
