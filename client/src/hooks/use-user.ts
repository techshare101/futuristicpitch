import useSWR from "swr";
import type { User } from "../../types";
import { useState, useCallback } from "react";

const TOKEN_KEY = 'auth_token';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface TokenValidationResult {
  isValid: boolean;
  error?: string;
}

interface AuthError extends Error {
  status?: number;
  code?: string;
}

// Enhanced token validation with structured error handling
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
    
    // Basic JWT structure validation (3 parts)
    const parts = tokenPart.split('.');
    if (parts.length !== 3) {
      console.log("[useUser] Invalid token structure");
      return { isValid: false, error: "Invalid token structure" };
    }

    // Validate base64url encoding for each part
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

// Helper function to ensure Bearer prefix
const ensureBearerPrefix = (token: string): string => {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

// Retry mechanism for failed requests
const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> => {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`[useUser] Request attempt ${i + 1} failed:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  throw lastError!;
};

export function useUser() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, error, mutate } = useSWR<User>("/api/auth/status", {
    revalidateOnFocus: false,
    refreshInterval: REFRESH_INTERVAL,
    shouldRetryOnError: false,
    onError: async (err: AuthError) => {
      console.error("[useUser] Auth error:", err);
      
      if (err.status === 401 || err.status === 403) {
        const token = getToken();
        if (token) {
          console.log("[useUser] Token exists but unauthorized, attempting validation");
          const validationResult = validateToken(token);
          
          if (!validationResult.isValid || err.code === 'TOKEN_EXPIRED') {
            console.log("[useUser] Token invalid or expired, clearing");
            clearToken();
            await mutate(undefined, { revalidate: false });
          }
        }
      }
    }
  });

  const setToken = useCallback((token: string) => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error("Invalid token provided");
      }

      const tokenWithPrefix = ensureBearerPrefix(token);
      const validationResult = validateToken(tokenWithPrefix);
      
      if (!validationResult.isValid) {
        throw new Error(validationResult.error || "Token validation failed");
      }

      localStorage.setItem(TOKEN_KEY, tokenWithPrefix);
      console.log("[useUser] Token stored successfully");
    } catch (error) {
      console.error("[useUser] Token storage error:", error);
      clearToken();
      throw error;
    }
  }, []);

  const getToken = useCallback((): string | null => {
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
  }, []);

  const clearToken = useCallback(() => {
    console.log("[useUser] Clearing auth token");
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const refreshToken = useCallback(async () => {
    if (isRefreshing) {
      console.log("[useUser] Token refresh already in progress");
      return;
    }
    
    try {
      setIsRefreshing(true);
      console.log("[useUser] Starting token refresh");
      
      const response = await retryRequest(() =>
        fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Authorization": getToken() || "",
          },
        })
      );

      if (response.ok) {
        const newToken = response.headers.get("X-New-Token");
        if (newToken) {
          console.log("[useUser] New token received");
          setToken(newToken);
          await mutate();
        }
      }
    } catch (error) {
      console.error("[useUser] Token refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, getToken, setToken, mutate]);

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

        console.log("[useUser] Login successful, storing token");
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
        console.log("[useUser] Initiating logout");
        const token = getToken();
        if (token) {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: { "Authorization": token }
          });
        }
        clearToken();
        await mutate(undefined, { revalidate: false });
        console.log("[useUser] Logout successful");
        return { ok: true };
      } catch (error) {
        console.error("[useUser] Logout error:", error);
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Logout failed"
        };
      }
    },
    refreshToken,
  };
}
