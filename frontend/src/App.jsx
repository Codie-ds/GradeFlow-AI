import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import CreateAssignment from "./pages/CreateAssignment";
import AssignmentPage from "./pages/AssignmentPage";
import ResultPage from "./pages/ResultPage";

function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        className="absolute top-[-15%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px]"
        style={{ background: "rgba(59,130,246,0.12)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[150px]"
        style={{ background: "rgba(99,102,241,0.08)" }}
      />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      <AmbientBackground />
      {!isLandingPage && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<CreateAssignment />} />
        <Route path="/assignments/:id" element={<AssignmentPage />} />
        <Route
          path="/assignments/:assignmentId/submissions/:submissionId"
          element={<ResultPage />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


