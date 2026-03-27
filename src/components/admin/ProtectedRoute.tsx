import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-[var(--background)]">
        <div className="w-[24px] h-[24px] border-2 border-[var(--primary-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) return <Navigate to="/" replace />;
  if (role !== "admin" && role !== "editor") return <Navigate to="/" replace />;

  return <>{children}</>;
}
