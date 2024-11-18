import useSWR from "swr";
import type { User } from "../../types";

const TOKEN_KEY = 'auth_token';

export function useUser() {
  const { data, error, mutate } = useSWR<User>("/api/auth/status", {
    revalidateOnFocus: false,
    onError: (err) => {
      console.log("[useUser] Auth error:", err);
      if (err.status === 401) {
        console.log("[useUser] Clearing token due to auth error");
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  });

  const setToken = (token: string) => {
    console.log("[useUser] Storing auth token");
    localStorage.setItem(TOKEN_KEY, token);
  };

  const getToken = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("[useUser] Retrieved token:", token ? "exists" : "not found");
    return token;
  };

  const clearToken = () => {
    console.log("[useUser] Clearing auth token");
    localStorage.removeItem(TOKEN_KEY);
  };

  const getFetchHeaders = () => {
    const token = getToken();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  };

  return {
    user: data,
    isLoading: !error && !data,
    error,
    getToken,
    getFetchHeaders,
    login: async (credentials: { email: string; password: string }) => {
      try {
        console.log("[useUser] Attempting login");
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("[useUser] Login failed:", data.error);
          throw new Error(data.error || "Login failed");
        }

        console.log("[useUser] Login successful");
        setToken(data.token);
        await mutate();
        return { ok: true, data };
      } catch (error) {
        console.error("[useUser] Login error:", error);
        clearToken();
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
    logout: async () => {
      try {
        console.log("[useUser] Logging out");
        clearToken();
        await mutate(undefined);
        return { ok: true };
      } catch (error) {
        console.error("[useUser] Logout error:", error);
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Logout failed",
        };
      }
    },
  };
}
