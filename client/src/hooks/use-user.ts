import useSWR from "swr";
import type { User } from "../../types";
import { useState, useCallback, useRef, useEffect } from "react";

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

const validateToken = (token: string | null): TokenValidationResult => {
  console.log("[useUser] Starting token validation");
  
  if (!token) {
    console.log("[useUser] No token available");
    return { isValid: false, error: "No token available" };
  }

  try {
    // Parse token and validate structure
    const tokenPart = token.split(' ')[1] || token;
    
    // Validate JWT structure
    const parts = tokenPart.split('.');
    if (parts.length !== 3) {
      console.log("[useUser] Invalid token structure");
      return { isValid: false, error: "Invalid token format" };
    }

    // Basic validation of each part
    const isValidParts = parts.every(part => {
      try {
        const buffer = Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
        return buffer.length > 0;
      } catch {
        return false;
      }
    });

    if (!isValidParts) {
      console.log("[useUser] Invalid token parts");
      return { isValid: false, error: "Invalid token format" };
    }

    console.log("[useUser] Token validation successful");
    return { isValid: true };
  } catch (error) {
    console.error("[useUser] Token validation error:", error);
    return { isValid: false, error: "Token validation failed" };
  }
};

const fetchWithToken = async (url: string) => {
  const token = getToken();
  if (!token) {
    throw new Error("No token available");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.") as AuthError;
    error.status = response.status;
    const data = await response.json();
    error.info = data;
    throw error;
  }

  return response.json();
};

const setToken = (token: string) => {
  if (!token) return;
  const tokenWithPrefix = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  localStorage.setItem(TOKEN_KEY, tokenWithPrefix);
  console.log("[useUser] Token stored successfully");
};

const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log("[useUser] Token retrieved:", token ? 'exists' : 'not found');
  return token;
};

const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.log(`[useUser] Request attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) break;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw lastError || new Error("Max retries exceeded");
};

export function useUser() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const unmountedRef = useRef(false);

  const clearToken = useCallback(() => {
    console.log("[useUser] Clearing auth token");
    localStorage.removeItem(TOKEN_KEY);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  }, []);

  const { data: user, error, mutate } = useSWR<User>(
    "/api/auth/status",
    fetchWithToken,
    {
      revalidateOnFocus: false,
      refreshInterval: REFRESH_INTERVAL,
      shouldRetryOnError: false,
      onError: async (err: AuthError) => {
        console.error("[useUser] Auth error:", err);
        
        if (err.status === 401 || err.status === 403) {
          const token = getToken();
          if (token) {
            console.log("[useUser] Token exists but unauthorized, validating");
            const validationResult = validateToken(token);
            
            if (!validationResult.isValid) {
              console.log("[useUser] Token invalid, clearing");
              clearToken();
              await mutate(undefined, { revalidate: false });
            }
          }
        }
      }
    }
  );

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    user,
    isLoading: !error && !user,
    error,
    getToken,
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
          throw new Error(data.error || "Login failed");
        }

        if (!data.token) {
          throw new Error("No token received from server");
        }

        console.log("[useUser] Login successful");
        setToken(data.token);
        await mutate();
        
        const returnTo = sessionStorage.getItem('returnTo');
        return { 
          ok: true, 
          data,
          returnTo: returnTo || '/getting-started'
        };
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
    }
  };
}
