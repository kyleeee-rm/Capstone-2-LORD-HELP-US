import {BrowserRouter, Routes, Route} from "react-router-dom";

// Pages
import Welcome from "../pages/welcome";
import Home from "../pages/home";
import NotFound from "../pages/not-found";

// Auth
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";

// Legal
import Terms from "../pages/legal/terms";
import Privacy from "../pages/legal/privacy";

// Dashboard
import DashboardLayout from "../layouts/dashboard-layout";
import Dashboard from "../pages/dashboard/dashboard";
import QuestionsGeneration from "../pages/dashboard/question-generation";
import SheetScanning from "../pages/dashboard/sheet-scanning";
import ItemAnalysis from "../pages/dashboard/item-analysis";
import Search from "../pages/dashboard/search";
import Notifications from "../pages/dashboard/notifications";
import Library from "../pages/dashboard/library";
import Reports from "../pages/dashboard/reports";
import Settings from "../pages/dashboard/settings";
import Help from "../pages/dashboard/help";
import Menu from "../pages/dashboard/menu";
import ProfileDetail from "../pages/dashboard/profile-detail";
import SubjectDetail from "../pages/dashboard/subject-detail";

// Subjects
import SubjectLibrary from "../pages/subjects/subject-library";
import SubjectFolder from "../pages/subjects/subject-folder";

// Guards
import ProtectedRoute from "../components/protected-route";

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
						<Route
							path="questions-generation"
							element={<QuestionsGeneration />}
						/>
						<Route path="question-generation/:id" element={<SubjectDetail />} />
						<Route path="sheet-scanning" element={<SheetScanning />} />
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
