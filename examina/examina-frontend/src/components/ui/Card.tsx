import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8 md:p-10",
};

export default function Card({ children, className = "", padding = "md" }: Props) {
  return (
    <div
      className={`rounded-xl bg-surface shadow-md ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
