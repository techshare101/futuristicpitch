import useSWR from "swr";
import type { User } from "../../types";

const TOKEN_KEY = 'auth_token';

// Utility to validate JWT token format
const isValidJWT = (token: string): boolean => {
  const tokenPart = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
  const tokenRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/;
  return tokenRegex.test(tokenPart);
};

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

    // Validate token format
    if (!isValidJWT(token.startsWith('Bearer ') ? token.split(' ')[1] : token)) {
      console.error("[useUser] Invalid token format");
      return;
    }

    console.log("[useUser] Storing auth token");
    // Ensure token has Bearer prefix when storing
    const tokenWithPrefix = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    localStorage.setItem(TOKEN_KEY, tokenWithPrefix);
  };

  const getToken = () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      console.log("[useUser] Retrieved token:", token ? "exists" : "not found");
      
      if (!token) return null;

      // Validate stored token format
      if (!isValidJWT(token.startsWith('Bearer ') ? token.split(' ')[1] : token)) {
        console.error("[useUser] Stored token is invalid, clearing");
        clearToken();
        return null;
      }

      // Ensure Bearer prefix
      if (!token.startsWith('Bearer ')) {
        const tokenWithPrefix = `Bearer ${token}`;
        localStorage.setItem(TOKEN_KEY, tokenWithPrefix);
        return tokenWithPrefix;
      }

      return token;
    } catch (error) {
      console.error("[useUser] Error retrieving token:", error);
      clearToken();
      return null;
    }
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
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error("[useUser] Auth request failed:", data.error || response.statusText);
      throw new Error(data.error || "Authentication failed");
    }

    const data = await response.json();
    
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
