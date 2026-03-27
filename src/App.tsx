import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentsDirectory from "./pages/StudentsDirectory";
import { useAuth } from "./context/AuthContext";

/* ── Admin (lazy-loaded) ── */
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const StudentsPage = lazy(() => import("./pages/admin/StudentsPage"));
const EmailBlastPage = lazy(() => import("./pages/admin/EmailBlastPage"));
const WhatsAppBlastPage = lazy(() => import("./pages/admin/WhatsAppBlastPage"));
const EventsPage = lazy(() => import("./pages/admin/EventsPage"));
const MembersPage = lazy(() => import("./pages/admin/MembersPage"));
const PartnersPage = lazy(() => import("./pages/admin/PartnersPage"));
const ProjectsPage = lazy(() => import("./pages/admin/ProjectsPage"));
const AnnouncementsPage = lazy(() => import("./pages/admin/AnnouncementsPage"));
const LandingPage = lazy(() => import("./pages/admin/LandingPage"));
const QRRegistrationPage = lazy(() => import("./pages/admin/QRRegistrationPage"));

const AdminSpinner = () => (
  <div className="flex items-center justify-center w-full h-screen bg-[var(--background)]">
    <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-[var(--background)]">
        <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!authenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/directory" element={<RequireAuth><StudentsDirectory /></RequireAuth>} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<AdminSpinner />}>
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          </Suspense>
        }
      >
        <Route index element={<Suspense fallback={<AdminSpinner />}><DashboardPage /></Suspense>} />
        <Route path="students" element={<Suspense fallback={<AdminSpinner />}><StudentsPage /></Suspense>} />
        <Route path="email-blast" element={<Suspense fallback={<AdminSpinner />}><EmailBlastPage /></Suspense>} />
        <Route path="whatsapp-blast" element={<Suspense fallback={<AdminSpinner />}><WhatsAppBlastPage /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<AdminSpinner />}><EventsPage /></Suspense>} />
        <Route path="members" element={<Suspense fallback={<AdminSpinner />}><MembersPage /></Suspense>} />
        <Route path="partners" element={<Suspense fallback={<AdminSpinner />}><PartnersPage /></Suspense>} />
        <Route path="projects" element={<Suspense fallback={<AdminSpinner />}><ProjectsPage /></Suspense>} />
        <Route path="announcements" element={<Suspense fallback={<AdminSpinner />}><AnnouncementsPage /></Suspense>} />
        <Route path="landing" element={<Suspense fallback={<AdminSpinner />}><LandingPage /></Suspense>} />
        <Route path="qr-registration" element={<Suspense fallback={<AdminSpinner />}><QRRegistrationPage /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default App;
