import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "../lib/supabase";
import type { Profile, UserRole } from "../lib/database.types";

interface AuthState {
  authenticated: boolean;
  userId: string | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const privyId = user?.id ?? null;

  useEffect(() => {
    if (!authenticated || !privyId) {
      setProfile(null);
      return;
    }

    async function fetchOrCreateProfile() {
      setProfileLoading(true);

      // Try to fetch existing profile by Privy ID
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", privyId!)
        .single();

      if (existing) {
        setProfile(existing);
      } else {
        // Create profile on first login
        const email =
          user?.email?.address ??
          user?.google?.email ??
          "";
        const fullName =
          user?.google?.name ?? null;

        const { data: created } = await supabase
          .from("profiles")
          .insert({
            id: privyId!,
            email,
            full_name: fullName,
            role: "editor" as UserRole,
          })
          .select()
          .single();

        setProfile(created);
      }

      setProfileLoading(false);
    }

    fetchOrCreateProfile();
  }, [authenticated, privyId]);

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        userId: privyId,
        profile,
        role: profile?.role ?? null,
        loading: !ready || profileLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
