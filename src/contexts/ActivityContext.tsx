"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  loading: boolean;
  addActivity: (activity: Omit<Activity, "id" | "time">) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch("/api/activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = async (activity: Omit<Activity, "id" | "time">) => {
    // Optimistic update
    const optimistic: Activity = {
      ...activity,
      id: Math.random().toString(36).substring(7),
      time: new Date().toISOString(),
    };
    setActivities((prev) => [optimistic, ...prev].slice(0, 50));

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });
      if (res.ok) {
        const newActivity = await res.json();
        // Replace optimistic entry with server entry
        setActivities((prev) =>
          prev.map((a) => (a.id === optimistic.id ? newActivity : a))
        );
      }
    } catch (error) {
      console.error("Failed to add activity:", error);
    }
  };

  return (
    <ActivityContext.Provider value={{ activities, loading, addActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error("useActivity must be used within ActivityProvider");
  return context;
}
