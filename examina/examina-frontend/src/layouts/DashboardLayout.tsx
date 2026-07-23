import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: "200px" }}>Sidebar</aside>
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}
