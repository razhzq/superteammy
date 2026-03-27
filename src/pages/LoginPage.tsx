import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { authenticated, login, loading } = useAuth();

  // Redirect if already logged in
  if (authenticated && !loading) {
    navigate("/directory", { replace: true });
    return null;
  }

  return (
    <div className="relative flex w-full h-screen overflow-hidden bg-[var(--background)]">
      {/* Full-screen digital batik background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/digital-batik.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.35) contrast(1.05) saturate(0.6)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(85,34,224,0.2) 0%, rgba(244,166,11,0.1) 60%, rgba(85,34,224,0.08) 100%)",
          mixBlendMode: "color",
        }}
      />
      <div
        className="absolute w-[700px] h-[700px] rounded-full"
        style={{
          left: "5%",
          top: "15%",
          background: "radial-gradient(circle, rgba(85,34,224,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          right: "10%",
          bottom: "5%",
          background: "radial-gradient(circle, rgba(244,166,11,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Left content area */}
      <div className="relative flex-1 flex items-end p-[48px]">
        <div className="flex flex-col gap-[10px]">
          <span className="font-inter text-[22px] font-semibold text-[#F5F5F5] opacity-90 tracking-[-0.4px]">
            Building the future of Web3 in Malaysia.
          </span>
          <span className="font-inter text-[13px] text-[#F5F5F5] opacity-30 tracking-[0.5px]">
            Ancora Imparo
          </span>
        </div>
      </div>

      {/* Right Login Panel */}
      <div
        className="relative flex flex-col items-center justify-center w-[560px] shrink-0 px-[60px] border-l border-white/[0.06]"
        style={{
          background: "rgba(9, 9, 11, 0.45)",
          backdropFilter: "blur(24px) saturate(1.3)",
          WebkitBackdropFilter: "blur(24px) saturate(1.3)",
        }}
      >
        <div
          className="flex flex-col items-center w-[400px] rounded-[20px] border border-white/[0.1] p-[48px_40px]"
          style={{
            background: "rgba(9, 9, 11, 0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="h-[28px]" />
          <h1 className="font-inter text-[24px] font-semibold text-[var(--text-primary)] tracking-[-0.5px]">
            Welcome to Ancora Imparo
          </h1>
          <div className="h-[8px]" />
          <p className="font-inter text-[14px] text-[var(--text-secondary)] text-center max-w-[320px]">
            Sign in to manage Ancora Imparo content.
          </p>
          <div className="h-[36px]" />

          {/* Sign In */}
          <button
            onClick={login}
            className="flex items-center justify-center gap-[10px] w-full h-[52px] rounded-[14px] cursor-pointer transition-all hover:brightness-110 shadow-[0_4px_20px_rgba(85,34,224,0.25)]"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            }}
          >
            <span className="font-inter text-[15px] font-semibold text-white tracking-[-0.2px]">
              Sign In
            </span>
          </button>

          <div className="h-[28px]" />

          <p className="font-inter text-[11px] text-[var(--text-muted)] text-center leading-[1.5] max-w-[300px]">
            Only authorized admins and editors can access the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
