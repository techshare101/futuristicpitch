import useSWR from "swr";
import type { User } from "../../types";
import { useState } from "react";

const TOKEN_KEY = 'auth_token';

export function useUser() {
  const [isLoading, setIsLoading] = useState(false);

  // Simplified token handling - always return mock user
  const { data: user } = useSWR<User>("/api/auth/status", {
    revalidateOnFocus: false,
    fallbackData: { id: "public", email: "public@example.com" }
  });

  return {
    user,
    isLoading,
    login: async (credentials: { email: string; password: string }) => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, `Bearer ${data.token}`);
        
        return { 
          ok: true,
          data,
          returnTo: sessionStorage.getItem('returnTo') || '/generator'
        };
      } catch (error) {
        console.error("[useUser] Login error:", error);
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Login failed"
        };
      } finally {
        setIsLoading(false);
      }
    },
    logout: async () => {
      localStorage.removeItem(TOKEN_KEY);
      return { ok: true };
    }
  };
}
