"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  addTask: (task: Omit<Task, "id" | "type">) => void;
  updateTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  addMilestone: (name: string, date: Date, department: Department) => void;
}

const mockTasks: Task[] = [
  {
    id: "1",
    name: "Chassis Design",
    start: subDays(new Date(), 10),
    end: addDays(new Date(), 5),
    progress: 80,
    type: "task",
    department: "Mechanical",
    status: "IN_PROGRESS",
    assignedTo: "Etienne",
    styles: { progressColor: "#3b82f6", progressSelectedColor: "#2563eb" },
  },
  {
    id: "2",
    name: "Aerodynamics Sim",
    start: subDays(new Date(), 5),
    end: addDays(new Date(), 10),
    progress: 40,
    type: "task",
    department: "Mechanical",
    status: "IN_PROGRESS",
    assignedTo: "Sarah",
    dependencies: ["1"],
    styles: { progressColor: "#10b981", progressSelectedColor: "#059669" },
  },
  {
    id: "3",
    name: "Battery Pack Assembly",
    start: addDays(new Date(), 2),
    end: addDays(new Date(), 14),
    progress: 0,
    type: "task",
    department: "Electrical",
    status: "TODO",
    assignedTo: "Alex",
    styles: { progressColor: "#eab308", progressSelectedColor: "#ca8a04" },
  },
  {
    id: "4",
    name: "Budget Review",
    start: subDays(new Date(), 2),
    end: addDays(new Date(), 2),
    progress: 100,
    type: "task",
    department: "Lead Operations",
    status: "DONE",
    assignedTo: "Admin",
    styles: { progressColor: "#a855f7", progressSelectedColor: "#9333ea" },
  },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate on mount from localStorage or use mockTasks
  useEffect(() => {
    const saved = localStorage.getItem("fs_tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((t: any) => ({
          ...t,
          start: new Date(t.start),
          end: new Date(t.end)
        }));
        setTasks(parsed);
      } catch (e) {
        setTasks(mockTasks);
      }
    } else {
      setTasks(mockTasks);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fs_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isHydrated]);

  const addTask = (taskData: Omit<Task, "id" | "type">) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substring(7),
      type: "task",
      styles: { progressColor: "#3b82f6", progressSelectedColor: "#2563eb" },
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map((t) => {
      if (t.id === id) {
        let progress = t.progress;
        if (status === "DONE") progress = 100;
        if (status === "TODO") progress = 0;
        return { ...t, status, progress };
      }
      return t;
    }));
  };

  const addMilestone = (name: string, date: Date, department: Department) => {
    const newMilestone: Task = {
      id: Math.random().toString(36).substring(7),
      name,
      start: date,
      end: date,
      progress: 100,
      type: "milestone",
      department,
      status: "DONE",
      assignedTo: "System",
      styles: { progressColor: "#ef4444", progressSelectedColor: "#b91c1c" }
    };
    setTasks([...tasks, newMilestone]);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, updateTaskStatus, deleteTask, addMilestone }}>
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
