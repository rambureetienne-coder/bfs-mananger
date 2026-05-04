"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  login: (userId: string) => void;
  logout: () => void;
  createUser: (name: string, role: Role, department: Department) => void;
  isHydrated: boolean;
}

const defaultUsers: User[] = [
  { id: "1", name: "Etienne", role: "Admin", department: "Lead Operations" },
  { id: "2", name: "Sarah", role: "Lead", department: "Mechanical" },
  { id: "3", name: "Alex", role: "Member", department: "Electrical" },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("fs_users");
    const savedCurrentUser = localStorage.getItem("fs_current_user");

    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        setUsers(defaultUsers);
      }
    } else {
      setUsers(defaultUsers);
    }

    if (savedCurrentUser) {
      try {
        setCurrentUser(JSON.parse(savedCurrentUser));
      } catch (e) {
        setCurrentUser(null);
      }
    }
    
    setIsHydrated(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fs_users", JSON.stringify(users));
      if (currentUser) {
        localStorage.setItem("fs_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("fs_current_user");
      }
    }
  }, [users, currentUser, isHydrated]);

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createUser = (name: string, role: Role, department: Department) => {
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      name,
      role,
      department
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser); // Auto-login after creation
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, createUser, isHydrated }}>
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
