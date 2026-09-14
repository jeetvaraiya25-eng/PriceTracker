import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTok] = useState(getToken());
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    api("/api/auth/me", { token })
      .then((data) => {
        setUser(data.user);
        if (data.token) {
          setToken(data.token);
          setTok(data.token);
        }
      })
      .catch(() => {
        setToken(null);
        setTok(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login: (nextToken, nextUser) => {
        setToken(nextToken);
        setTok(nextToken);
        setUser(nextUser);
      },
      logout: () => {
        setToken(null);
        setTok(null);
        setUser(null);
      },
      setUser,
      refresh: async () => {
        const data = await api("/api/auth/me");
        setUser(data.user);
        return data.user;
      },
      saveUsername: async (username) => {
        let data;
        try {
          data = await api("/api/account/profile", { method: "PATCH", body: { username } });
        } catch (err) {
          if (!/404|405|failed \(40/.test(err.message)) throw err;
          data = await api("/api/account/profile", { method: "POST", body: { username } });
        }
        if (!data?.user) throw new Error("Could not save username");
        setUser(data.user);
        return data.user;
      },
      savePlan: async (plan) => {
        const data = await api("/api/account/plan", { method: "PATCH", body: { plan } });
        if (!data?.user) throw new Error("Could not update plan");
        setUser(data.user);
        return data.user;
      },
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
