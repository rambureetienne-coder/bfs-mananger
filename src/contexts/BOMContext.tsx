"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  addPart: (part: Omit<Part, "id">) => void;
  updatePart: (part: Part) => void;
  deletePart: (id: string) => void;
}

const mockParts: Part[] = [
  {
    id: "p1",
    name: "Front Wing Mainplane",
    department: "Mechanical",
    material: "Carbon Fiber",
    manufacturer: "In-house",
    cost: 450,
    weight: 1.2,
    quantity: 1,
    status: "Usiné",
  },
  {
    id: "p2",
    name: "Ohlins TTX25 Dampers",
    department: "Mechanical",
    material: "Aluminum",
    manufacturer: "Ohlins",
    cost: 3200,
    weight: 2.4,
    quantity: 4,
    status: "Reçu",
  },
  {
    id: "p3",
    name: "HV Battery Cells",
    department: "Electrical",
    material: "Lithium-Ion",
    manufacturer: "Melasta",
    cost: 4500,
    weight: 35.0,
    quantity: 144,
    status: "Commandé",
  },
  {
    id: "p4",
    name: "Brake Calipers",
    department: "Mechanical",
    material: "Aluminum",
    manufacturer: "AP Racing",
    cost: 1800,
    weight: 1.8,
    quantity: 4,
    status: "Achat",
  },
  {
    id: "p5",
    name: "Inverter",
    department: "Electrical",
    material: "Mixed",
    manufacturer: "Cascardia",
    cost: 2500,
    weight: 5.5,
    quantity: 1,
    status: "Conception",
  }
];

const BOMContext = createContext<BOMContextType | undefined>(undefined);

export function BOMProvider({ children }: { children: React.ReactNode }) {
  const [parts, setParts] = useState<Part[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fs_bom");
    if (saved) {
      try {
        setParts(JSON.parse(saved));
      } catch (e) {
        setParts(mockParts);
      }
    } else {
      setParts(mockParts);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fs_bom", JSON.stringify(parts));
    }
  }, [parts, isHydrated]);

  const addPart = (partData: Omit<Part, "id">) => {
    const newPart: Part = {
      ...partData,
      id: Math.random().toString(36).substring(7),
    };
    setParts([...parts, newPart]);
  };

  const updatePart = (updatedPart: Part) => {
    setParts(parts.map((p) => (p.id === updatedPart.id ? updatedPart : p)));
  };

  const deletePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  return (
    <BOMContext.Provider value={{ parts, addPart, updatePart, deletePart }}>
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
