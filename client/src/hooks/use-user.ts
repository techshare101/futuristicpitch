import useSWR from "swr";
import type { User } from "../../types";

const TOKEN_KEY = 'auth_token';

export function useUser() {
  const { data, error, mutate } = useSWR<User>("/api/auth/status", {
    revalidateOnFocus: false,
    onError: (err) => {
      // Clear token on auth errors
      if (err.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  });

  const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
  };

  return {
    user: data,
    isLoading: !error && !data,
    error,
    getToken,
    login: async (credentials: { email: string; password: string }) => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        setToken(data.token);
        await mutate();
        return { ok: true, data };
      } catch (error) {
        clearToken();
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
    logout: async () => {
      try {
        clearToken();
        await mutate(undefined);
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Logout failed",
        };
      }
    },
  };
}
