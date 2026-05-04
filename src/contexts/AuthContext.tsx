"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Department } from "./TaskContext";

export type Role = "Lead" | "Member" | "Admin";

export interface User {
  id: string;
  name: string;
  role: Role;
  department: Department;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  createUser: (name: string, role: Role, department: Department) => void;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch users from API on mount
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        return data as User[];
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  useEffect(() => {
    const init = async () => {
      const fetchedUsers = await fetchUsers();
      
      // Restore current user from localStorage (session persistence)
      const savedCurrentUser = localStorage.getItem("fs_current_user");
      if (savedCurrentUser) {
        try {
          const parsed = JSON.parse(savedCurrentUser);
          // Verify user still exists in DB
          const found = fetchedUsers.find((u: User) => u.id === parsed.id);
          if (found) {
            setCurrentUser(found);
          }
        } catch (e) {
          // Invalid stored data
        }
      }
      
      setIsHydrated(true);
    };
    init();
  }, [fetchUsers]);

  // Save current user to localStorage for session persistence
  useEffect(() => {
    if (isHydrated) {
      if (currentUser) {
        localStorage.setItem("fs_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("fs_current_user");
      }
    }
  }, [currentUser, isHydrated]);

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createUser = async (name: string, role: Role, department: Department) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, department }),
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser); // Auto-login after creation
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to create user:", res.status, errorData);
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, loading, login, logout, createUser, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
