"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthScreen } from "./AuthScreen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, isHydrated } = useAuth();

  // Show nothing while checking localStorage to prevent flicker
  if (!isHydrated) return null;

  if (!currentUser) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
