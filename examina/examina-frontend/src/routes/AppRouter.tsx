import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome";
import Login from "../pages/auth/Login";
import NotFound from "../pages/NotFound";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}