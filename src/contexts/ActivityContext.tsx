"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type ActivityStatus = "DONE" | "PENDING" | "COMPLETED" | "ADDED" | "IN_PROGRESS" | "REVIEW" | "REMOVED" | "UPDATED";

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  status: ActivityStatus;
  time: string; // ISO string
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "time">) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fs_activities");
    if (saved) {
      try { setActivities(JSON.parse(saved)); } catch (e) {}
    } else {
      setActivities([
        { id: "1", user: "Etienne", action: "a terminé la tâche", target: "Chassis Torsional Testing", status: "DONE", time: new Date(Date.now() - 2 * 3600000).toISOString() },
        { id: "2", user: "Sarah", action: "a soumis une demande d'achat pour", target: "Ohlins TTX25 MkII Dampers", status: "PENDING", time: new Date(Date.now() - 4 * 3600000).toISOString() },
      ]);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fs_activities", JSON.stringify(activities));
    }
  }, [activities, isHydrated]);

  const addActivity = (activity: Omit<Activity, "id" | "time">) => {
    const newActivity = {
      ...activity,
      id: Math.random().toString(36).substring(7),
      time: new Date().toISOString(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error("useActivity must be used within ActivityProvider");
  return context;
}
