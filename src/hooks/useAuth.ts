/**
 * Authentication Hook
 *
 * Custom hook to get current user information from JWT token.
 * Provides user data and authentication status for client components.
 */

"use client";

import { useState, useEffect } from "react";

interface User {
  username: string;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call API to get current user info
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          // User not authenticated
          setUser(null);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
