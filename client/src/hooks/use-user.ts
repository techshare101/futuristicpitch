import useSWR from "swr";
import type { User } from "../../types";

const TOKEN_KEY = 'auth_token';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface TokenValidationResult {
  isValid: boolean;
  error?: string;
}

// Utility to validate JWT token format with detailed logging
const validateToken = (token: string | null): TokenValidationResult => {
  console.log("[useUser] Starting token validation");
  
  if (!token) {
    console.log("[useUser] No token provided for validation");
    return { isValid: false, error: "No token provided" };
  }

  try {
    // Check Bearer prefix
    if (!token.startsWith('Bearer ')) {
      console.log("[useUser] Token missing Bearer prefix");
      return { isValid: false, error: "Token missing Bearer prefix" };
    }

    const tokenPart = token.split(' ')[1];
    
    // Check basic JWT structure (3 parts separated by dots)
    const parts = tokenPart.split('.');
    if (parts.length !== 3) {
      console.log("[useUser] Invalid token structure");
      return { isValid: false, error: "Invalid token structure" };
    }

    // Validate each part is properly base64url encoded
    const isValidBase64 = parts.every(part => {
      try {
        return btoa(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) === 
               part.replace(/-/g, '+').replace(/_/g, '/');
      } catch {
        return false;
      }
    });

    if (!isValidBase64) {
      console.log("[useUser] Invalid token encoding");
      return { isValid: false, error: "Invalid token encoding" };
    }

    console.log("[useUser] Token validation successful");
    return { isValid: true };
  } catch (error) {
    console.error("[useUser] Token validation error:", error);
    return { isValid: false, error: "Token validation failed" };
  }
};

// Utility to ensure Bearer prefix
const ensureBearerPrefix = (token: string): string => {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export function useUser() {
  const { data, error, mutate } = useSWR<User>("/api/auth/status", {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    onError: async (err) => {
      console.error("[useUser] Auth error:", err);
      if (err.status === 401 || err.status === 403) {
        const token = getToken();
        if (token) {
          console.log("[useUser] Token exists but unauthorized, attempting validation");
          const validationResult = validateToken(token);
          if (!validationResult.isValid) {
            console.log("[useUser] Token validation failed, clearing token");
            clearToken();
          }
        }
        await mutate(undefined, { revalidate: false });
      }
    }
  });

  const setToken = (token: string) => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error("Invalid token provided");
      }

      const validationResult = validateToken(ensureBearerPrefix(token));
      if (!validationResult.isValid) {
        throw new Error(validationResult.error || "Token validation failed");
      }

      const tokenWithPrefix = ensureBearerPrefix(token);
      localStorage.setItem(TOKEN_KEY, tokenWithPrefix);
      console.log("[useUser] Token stored successfully");
    } catch (error) {
      console.error("[useUser] Token storage error:", error);
      clearToken();
      throw error;
    }
  };

  const getToken = (): string | null => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      console.log("[useUser] Retrieved token:", token ? "exists" : "not found");
      
      if (!token) return null;

      const validationResult = validateToken(token);
      if (!validationResult.isValid) {
        console.error("[useUser] Stored token is invalid:", validationResult.error);
        clearToken();
        return null;
      }

      return ensureBearerPrefix(token);
    } catch (error) {
      console.error("[useUser] Token retrieval error:", error);
      clearToken();
      return null;
    }
  };

  const clearToken = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      console.log("[useUser] Clearing auth token");
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const retryRequest = async (
    fn: () => Promise<any>,
    retries = MAX_RETRIES
  ): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.log(`[useUser] Retrying request, ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryRequest(fn, retries - 1);
      }
      throw error;
    }
  };

  return {
    user: data,
    isLoading: !error && !data,
    error,
    getToken,
    login: async (credentials: { email: string; password: string }) => {
      try {
        console.log("[useUser] Attempting login");
        const response = await retryRequest(() =>
          fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          })
        );

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        if (!data.token) {
          throw new Error("No token received from server");
        }

        setToken(data.token);
        await mutate();
        return { ok: true, data };
      } catch (error) {
        console.error("[useUser] Login error:", error);
        clearToken();
        await mutate(undefined, { revalidate: false });
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Login failed"
        };
      }
    },
    logout: async () => {
      try {
        clearToken();
        await mutate(undefined, { revalidate: false });
        return { ok: true };
      } catch (error) {
        console.error("[useUser] Logout error:", error);
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Logout failed"
        };
      }
    },
  };
}
