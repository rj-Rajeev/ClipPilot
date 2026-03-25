"use client";

import { useEffect, useState } from "react";
import AuthGate from "./AuthGate";
import Dashboard from "./Dashboard";

export default function AppShell() {
  const [isReady, setIsReady] = useState(false);
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const incomingState = params.get("auth_state");

      // ✅ Save new auth state from OAuth redirect
      if (incomingState) {
        localStorage.setItem("yt_state", incomingState);
        window.history.replaceState({}, "", "/");
      }

      // ✅ Load existing session
      const storedState = localStorage.getItem("yt_state");
      setAuthState(storedState || null);
    } catch (err) {
      console.error("AppShell init error:", err);
      setAuthState(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  // ✅ Better loading UI (mobile friendly)
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  // ✅ Auth routing
  return authState ? <Dashboard /> : <AuthGate />;
}