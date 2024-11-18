import useSWR from "swr";
import type { User } from "../../types";

const TOKEN_KEY = 'auth_token';

// Utility to validate JWT token format
const isValidJWT = (token: string): boolean => {
  try {
    const tokenPart = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const tokenRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/;
    return tokenRegex.test(tokenPart);
  } catch (error) {
    console.error("[useUser] Token validation error:", error);
    return false;
  }
};

// Utility to ensure token has Bearer prefix
const ensureBearerPrefix = (token: string): string => {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export function useUser() {
  const { data, error, mutate } = useSWR<User>("/api/auth/status", {
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("[useUser] Auth error:", err);
      if (err.status === 401 || err.status === 403) {
        console.log("[useUser] Clearing token due to auth error");
        clearToken();
        mutate(undefined);
      }
    }
  });

  const setToken = (token: string) => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error("Invalid token provided");
      }

      // Validate token format
      if (!isValidJWT(token)) {
        throw new Error("Invalid token format");
      }

      // Ensure token has Bearer prefix and store
      const tokenWithPrefix = ensureBearerPrefix(token);
      localStorage.setItem(TOKEN_KEY, tokenWithPrefix);
      console.log("[useUser] Token stored successfully");
    } catch (error) {
      console.error("[useUser] Token storage error:", error);
      clearToken();
      throw error;
    }
  };

  const getToken = () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      console.log("[useUser] Retrieved token:", token ? "exists" : "not found");
      
      if (!token) return null;

      // Validate stored token format
      if (!isValidJWT(token)) {
        console.error("[useUser] Stored token is invalid");
        clearToken();
        return null;
      }

      // Ensure Bearer prefix
      return ensureBearerPrefix(token);
    } catch (error) {
      console.error("[useUser] Token retrieval error:", error);
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = token;
    }

    return headers;
  };

  const handleResponse = async (response: Response) => {
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const error = new Error(data.error || response.statusText || 'Request failed');
      (error as any).status = response.status;
      throw error;
    }

    // Check for token refresh
    const newToken = response.headers.get('X-New-Token');
    if (newToken && isValidJWT(newToken)) {
      console.log("[useUser] Received new token");
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

        const data = await handleResponse(response);

        if (!data.token) {
          throw new Error("No token received from server");
        }

        setToken(data.token);
        await mutate();

        return { ok: true, data };
      } catch (error) {
        console.error("[useUser] Login error:", error);
        clearToken();
        await mutate(undefined);
        
        return {
          ok: false,
          error: error instanceof Error ? 
            error.message : 
            "An unexpected error occurred during login"
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
          error: error instanceof Error ? 
            error.message : 
            "An unexpected error occurred during logout"
        };
      }
    },
  };
}
