import useSWR from "swr";
import type { User } from "../../types";

export function useUser() {
  const { data, error, mutate } = useSWR<User>("/api/auth/status", {
    revalidateOnFocus: false,
  });

  return {
    user: data,
    isLoading: !error && !data,
    error,
    login: async (credentials: { email: string; password: string }) => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Login failed");
        }

        const data = await response.json();
        mutate();
        return { ok: true, data };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
    logout: async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Logout failed");
        }

        mutate(undefined);
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
