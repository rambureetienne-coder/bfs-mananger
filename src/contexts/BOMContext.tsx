"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Department } from "./TaskContext";

export type PartStatus = "Conception" | "Achat" | "Commandé" | "Usiné" | "Reçu";

export interface Part {
  id: string;
  name: string;
  department: Department;
  material: string;
  manufacturer: string;
  cost: number;
  weight: number;
  quantity: number;
  status: PartStatus;
  linkedTaskId?: string;
}

interface BOMContextType {
  parts: Part[];
  loading: boolean;
  addPart: (part: Omit<Part, "id">) => void;
  updatePart: (part: Part) => void;
  deletePart: (id: string) => void;
}

const BOMContext = createContext<BOMContextType | undefined>(undefined);

export function BOMProvider({ children }: { children: React.ReactNode }) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParts = useCallback(async () => {
    try {
      const res = await fetch("/api/parts");
      if (res.ok) {
        const data = await res.json();
        setParts(data);
      }
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const addPart = async (partData: Omit<Part, "id">) => {
    try {
      const res = await fetch("/api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partData),
      });
      if (res.ok) {
        const newPart = await res.json();
        setParts((prev) => [...prev, newPart]);
      }
    } catch (error) {
      console.error("Failed to add part:", error);
    }
  };

  const updatePart = async (updatedPart: Part) => {
    // Optimistic update
    setParts((prev) => prev.map((p) => (p.id === updatedPart.id ? updatedPart : p)));
    try {
      await fetch("/api/parts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPart),
      });
    } catch (error) {
      console.error("Failed to update part:", error);
      fetchParts();
    }
  };

  const deletePart = async (id: string) => {
    setParts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/parts?id=${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete part:", error);
      fetchParts();
    }
  };

  return (
    <BOMContext.Provider value={{ parts, loading, addPart, updatePart, deletePart }}>
      {children}
    </BOMContext.Provider>
  );
}

export function useBOM() {
  const context = useContext(BOMContext);
  if (context === undefined) {
    throw new Error("useBOM must be used within a BOMProvider");
  }
  return context;
}
