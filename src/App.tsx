import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Mission from "./components/Mission";
import Stats from "./components/Stats";
import Events from "./components/Events";
import Members from "./components/Members";
import Partners from "./components/Partners";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import JoinCTA from "./components/JoinCTA";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import MemberDirectoryV2 from "./pages/MemberDirectoryV2";

/* ── Admin (lazy-loaded) ── */
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const EventsPage = lazy(() => import("./pages/admin/EventsPage"));
const MembersPage = lazy(() => import("./pages/admin/MembersPage"));
const PartnersPage = lazy(() => import("./pages/admin/PartnersPage"));
const ProjectsPage = lazy(() => import("./pages/admin/ProjectsPage"));
const AnnouncementsPage = lazy(() => import("./pages/admin/AnnouncementsPage"));
const LandingPage = lazy(() => import("./pages/admin/LandingPage"));

const AdminSpinner = () => (
  <div className="flex items-center justify-center w-full h-screen bg-[var(--background)]">
    <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-full bg-[var(--background)]">
      <Navigation />
      <Hero />
      <Mission />
      <Stats />
      <Events />
      <Members />
      <Partners />
      <Testimonials />
      <FAQ />
      <JoinCTA />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/directory" element={<MemberDirectoryV2 />} />

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
        <Route path="events" element={<Suspense fallback={<AdminSpinner />}><EventsPage /></Suspense>} />
        <Route path="members" element={<Suspense fallback={<AdminSpinner />}><MembersPage /></Suspense>} />
        <Route path="partners" element={<Suspense fallback={<AdminSpinner />}><PartnersPage /></Suspense>} />
        <Route path="projects" element={<Suspense fallback={<AdminSpinner />}><ProjectsPage /></Suspense>} />
        <Route path="announcements" element={<Suspense fallback={<AdminSpinner />}><AnnouncementsPage /></Suspense>} />
        <Route path="landing" element={<Suspense fallback={<AdminSpinner />}><LandingPage /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default App;
