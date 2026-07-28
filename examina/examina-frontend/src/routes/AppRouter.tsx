import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Welcome from "../pages/Welcome";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Legal
import Terms from "../pages/legal/Terms";
import Privacy from "../pages/legal/Privacy";

// Dashboard
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import QuestionsGeneration from "../pages/dashboard/QuestionsGeneration";
import SheetScanning from "../pages/dashboard/SheetScanning";
import ItemAnalysis from "../pages/dashboard/ItemAnalysis";
import Search from "../pages/dashboard/Search";
import Notifications from "../pages/dashboard/Notifications";
import Library from "../pages/dashboard/Library";
import Reports from "../pages/dashboard/Reports";
import Settings from "../pages/dashboard/Settings";
import Help from "../pages/dashboard/Help";
import Menu from "../pages/dashboard/Menu";
import ProfileDetail from "../pages/dashboard/ProfileDetail";

// Subjects
import SubjectLibrary from "../pages/subjects/SubjectLibrary";
import SubjectFolder from "../pages/subjects/SubjectFolder";

// Guards
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Legal */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Dashboard (protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="questions" element={<QuestionsGeneration />} />
            <Route path="materials" element={<SheetScanning />} />
            <Route path="analysis" element={<ItemAnalysis />} />
            <Route path="search" element={<Search />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="library" element={<Library />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
            <Route path="menu" element={<Menu />} />
            <Route path="profile" element={<ProfileDetail />} />
          </Route>
        </Route>

        {/* Subjects (protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/subjects" element={<SubjectLibrary />} />
          <Route path="/subjects/:id" element={<SubjectFolder />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
