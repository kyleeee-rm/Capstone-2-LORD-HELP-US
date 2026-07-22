// src/layouts/DashboardLayout.tsx
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div>
      <nav>Navbar</nav>
      <main>{children}</main>
    </div>
  );
}