"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { addDays, subDays } from "date-fns";

export type Department = "Mechanical" | "Electrical" | "Lead Operations";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "Basse" | "Moyenne" | "Haute";

export interface Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: "task" | "project" | "milestone";
  hideChildren?: boolean;
  displayOrder?: number;
  project?: string;
  dependencies?: string[];
  styles?: {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
  
  // Custom fields
  department: Department;
  status: TaskStatus;
  assignedTo: string;
  priority?: TaskPriority;
  comments?: string;
  fileLink?: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, "id" | "type">) => void;
  updateTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  addMilestone: (name: string, date: Date, department: Department) => void;
}

const STYLE_MAP: Record<string, { progressColor: string; progressSelectedColor: string }> = {
  Mechanical: { progressColor: "#3b82f6", progressSelectedColor: "#2563eb" },
  Electrical: { progressColor: "#eab308", progressSelectedColor: "#ca8a04" },
  "Lead Operations": { progressColor: "#a855f7", progressSelectedColor: "#9333ea" },
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from API on mount
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        const parsed: Task[] = data.map((t: any) => ({
          ...t,
          start: new Date(t.start),
          end: new Date(t.end),
          styles: STYLE_MAP[t.department] || STYLE_MAP["Mechanical"],
        }));
        setTasks(parsed);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData: Omit<Task, "id" | "type">) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskData,
          start: taskData.start.toISOString(),
          end: taskData.end.toISOString(),
          type: "task",
        }),
      });
      if (res.ok) {
        const newTask = await res.json();
        const parsed: Task = {
          ...newTask,
          start: new Date(newTask.start),
          end: new Date(newTask.end),
          styles: STYLE_MAP[newTask.department] || STYLE_MAP["Mechanical"],
        };
        setTasks((prev) => [...prev, parsed]);
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedTask,
          start: updatedTask.start.toISOString(),
          end: updatedTask.end.toISOString(),
        }),
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert on error
      fetchTasks();
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    let progress = task.progress;
    if (status === "DONE") progress = 100;
    if (status === "TODO") progress = 0;
    const updated = { ...task, status, progress };
    await updateTask(updated);
  };

  const deleteTask = async (id: string) => {
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete task:", error);
      fetchTasks();
    }
  };

  const addMilestone = async (name: string, date: Date, department: Department) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          start: date.toISOString(),
          end: date.toISOString(),
          progress: 100,
          type: "milestone",
          department,
          status: "DONE",
          assignedTo: "System",
        }),
      });
      if (res.ok) {
        const newTask = await res.json();
        const parsed: Task = {
          ...newTask,
          start: new Date(newTask.start),
          end: new Date(newTask.end),
          styles: { progressColor: "#ef4444", progressSelectedColor: "#b91c1c" },
        };
        setTasks((prev) => [...prev, parsed]);
      }
    } catch (error) {
      console.error("Failed to add milestone:", error);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, updateTask, updateTaskStatus, deleteTask, addMilestone }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
