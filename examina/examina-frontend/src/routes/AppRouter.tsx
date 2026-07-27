import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Welcome from "../pages/Welcome";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Dashboard
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import QuestionGenerator from "../pages/dashboard/QuestionGenerator";
import MaterialSources from "../pages/dashboard/MaterialSources";
import ItemAnalysis from "../pages/dashboard/ItemAnalysis";
import Search from "../pages/dashboard/Search";
import Notifications from "../pages/dashboard/Notifications";
import Library from "../pages/dashboard/Library";
import Reports from "../pages/dashboard/Reports";
import Settings from "../pages/dashboard/Settings";
import Help from "../pages/dashboard/Help";
import Profile from "../pages/dashboard/Profile";

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

        {/* Dashboard (protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="questions" element={<QuestionGenerator />} />
            <Route path="materials" element={<MaterialSources />} />
            <Route path="analysis" element={<ItemAnalysis />} />
            <Route path="search" element={<Search />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="library" element={<Library />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
            <Route path="profile" element={<Profile />} />
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
