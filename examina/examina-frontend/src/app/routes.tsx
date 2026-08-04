import {BrowserRouter, Routes, Route} from "react-router-dom";

// Public pages
import Welcome from "@/pages/welcome";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// Auth
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import {ProtectedRoute} from "@/features/auth";

// Legal
import Terms from "@/pages/legal/terms";
import Privacy from "@/pages/legal/privacy";

// Dashboard
import {DashboardLayout} from "@/features/dashboard";
import Dashboard from "@/pages/dashboard/Dashboard";
import QuestionGeneration from "@/pages/dashboard/question-generation/QuestionGeneration";
import SheetScanning from "@/pages/dashboard/sheet-scanning/SheetScanning";
import ItemAnalysis from "@/pages/dashboard/item-analysis/ItemAnalysis";
import Search from "@/pages/dashboard/shared/components/Search";
import Notifications from "@/pages/dashboard/shared/components/Notifications";
import Library from "@/pages/dashboard/question-generation/components/Library";
import Menu from "@/pages/dashboard/shared/components/Menu";

// Subjects
import SubjectLibrary from "@/pages/dashboard/question-generation/components/SubjectLibrary";
import SubjectFolder from "@/pages/dashboard/question-generation/components/SubjectFolder";

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
							element={<QuestionGeneration />}
						/>
						<Route path="sheet-scanning" element={<SheetScanning />} />
						<Route path="analysis" element={<ItemAnalysis />} />
						<Route path="search" element={<Search />} />
						<Route path="notifications" element={<Notifications />} />
						<Route path="library" element={<Library />} />
						<Route path="menu" element={<Menu />} />
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
