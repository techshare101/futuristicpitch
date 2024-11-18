import useSWR from "swr";
import type { User } from "../../types";

const TOKEN_KEY = 'auth_token';

export function useUser() {
  const { data, error, mutate } = useSWR<User>("/api/auth/status", {
    revalidateOnFocus: false,
    onError: (err) => {
      console.log("[useUser] Auth error:", err);
      if (err.status === 401 || err.status === 403) {
        console.log("[useUser] Clearing token due to auth error");
        clearToken();
      }
    }
  });

  const setToken = (token: string) => {
    if (!token) {
      console.error("[useUser] Attempted to store empty token");
      return;
    }
    console.log("[useUser] Storing auth token");
    // Ensure token has Bearer prefix when storing
    const tokenWithPrefix = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    localStorage.setItem(TOKEN_KEY, tokenWithPrefix);
  };

  const getToken = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("[useUser] Retrieved token:", token ? "exists" : "not found");
    if (token && !token.startsWith('Bearer ')) {
      console.log("[useUser] Adding Bearer prefix to existing token");
      const tokenWithPrefix = `Bearer ${token}`;
      localStorage.setItem(TOKEN_KEY, tokenWithPrefix);
      return tokenWithPrefix;
    }
    return token;
  };

  const clearToken = () => {
    console.log("[useUser] Clearing auth token");
    localStorage.removeItem(TOKEN_KEY);
  };

  const getFetchHeaders = () => {
    const token = getToken();
    if (!token) {
      console.log("[useUser] No token available for headers");
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    };
  };

  const handleAuthResponse = async (response: Response) => {
    const data = await response.json();
    
    if (!response.ok) {
      console.error("[useUser] Auth request failed:", data.error);
      throw new Error(data.error || "Authentication failed");
    }

    // Check for token refresh
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
      console.log("[useUser] Received refreshed token");
      setToken(newToken);
    }

    return data;
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

        const data = await handleAuthResponse(response);
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
