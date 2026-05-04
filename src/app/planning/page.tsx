"use client";

import React, { useState } from "react";
import { Gantt, ViewMode, Task as GanttTask } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useTasks, Department, TaskStatus, Task, TaskPriority } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { addDays, subDays } from "date-fns";

export default function PlanningPage() {
  const { tasks, addTask, updateTask, addMilestone } = useTasks();
  const { users } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [departmentFilter, setDepartmentFilter] = useState<Department | "All">("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: "", date: new Date().toISOString().split('T')[0], department: "Lead Operations" as Department });
  const [newTask, setNewTask] = useState({
    name: "",
    start: new Date().toISOString().split('T')[0],
    end: addDays(new Date(), 7).toISOString().split('T')[0],
    department: "Mechanical" as Department,
    assignedTo: "",
    priority: "Moyenne" as TaskPriority,
    comments: "",
    fileLink: "",
  });

  const filteredTasks = tasks.filter((t) => 
    departmentFilter === "All" ? true : t.department === departmentFilter
  );

  const handleTaskChange = (task: GanttTask) => {
    updateTask(task as Task);
  };

  const handleTaskProgressChange = (task: GanttTask) => {
    updateTask(task as Task);
  };

  const handleDblClick = (task: GanttTask) => {
    const t = task as Task;
    alert(`Task: ${t.name}\nAssigned To: ${t.assignedTo}\nDepartment: ${t.department}`);
  };

  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.name || !newMilestone.date) return;
    
    addMilestone(newMilestone.name, new Date(newMilestone.date), newMilestone.department);
    setIsAddMilestoneModalOpen(false);
    setNewMilestone({ name: "", date: new Date().toISOString().split('T')[0], department: "Lead Operations" as Department });
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.name || !newTask.assignedTo) return;

    addTask({
      name: newTask.name,
      start: new Date(newTask.start),
      end: new Date(newTask.end),
      progress: 0,
      department: newTask.department,
      status: "TODO",
      assignedTo: newTask.assignedTo,
      priority: newTask.priority,
      comments: newTask.comments,
      fileLink: newTask.fileLink,
    });
    setIsAddModalOpen(false);
    setNewTask({ ...newTask, name: "", assignedTo: "" });
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Project Planning</h2>
          <p className="text-slate-400 mt-1">Interactive timeline and Gantt chart.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          + Add Task
        </button>
      </div>

      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex space-x-2">
          {["All", "Mechanical", "Electrical", "Lead Operations"].map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                departmentFilter === dept 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">View:</span>
          {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === mode 
                  ? "bg-slate-700 text-white" 
                  : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white text-slate-900 rounded-xl overflow-hidden border border-slate-800">
        {filteredTasks.length > 0 ? (
          <Gantt
            tasks={filteredTasks}
            viewMode={viewMode}
            onDateChange={handleTaskChange}
            onProgressChange={handleTaskProgressChange}
            onDoubleClick={handleDblClick}
            listCellWidth="155px"
            columnWidth={viewMode === ViewMode.Month ? 150 : 60}
          />
        ) : (
          <div className="p-12 text-center text-slate-500 bg-slate-950">
            No tasks found for this department.
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Jalons clés</h3>
          <button 
            onClick={() => setIsAddMilestoneModalOpen(true)}
            className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md transition-colors"
          >
            + Add Milestone
          </button>
        </div>
        <div className="space-y-3">
          {tasks.filter(t => t.type === "milestone").length > 0 ? (
            tasks.filter(t => t.type === "milestone").sort((a, b) => a.start.getTime() - b.start.getTime()).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="font-medium text-slate-200">{m.name}</span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{m.department}</span>
                </div>
                <span className="text-sm text-slate-400">
                  {new Date(m.start).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No key milestones defined yet.</p>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add New Task</h3>
            <form onSubmit={handleAddTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Task Name</label>
                <input 
                  type="text" 
                  required
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={newTask.start}
                    onChange={(e) => setNewTask({...newTask, start: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={newTask.end}
                    onChange={(e) => setNewTask({...newTask, end: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                  <select 
                    value={newTask.department}
                    onChange={(e) => setNewTask({...newTask, department: e.target.value as Department})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Lead Operations">Lead Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Priorité</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Basse">Basse</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Personne Responsable</label>
                <select 
                  required
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>-- Sélectionner un membre --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Lien vers fichier (Optionnel)</label>
                <input 
                  type="url" 
                  value={newTask.fileLink}
                  onChange={(e) => setNewTask({...newTask, fileLink: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Commentaires</label>
                <textarea 
                  rows={3}
                  value={newTask.comments}
                  onChange={(e) => setNewTask({...newTask, comments: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Détails supplémentaires..."
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Key Milestone</h3>
            <form onSubmit={handleAddMilestoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Milestone Name</label>
                <input 
                  type="text" 
                  required
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone({...newMilestone, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                <select 
                  value={newMilestone.department}
                  onChange={(e) => setNewMilestone({...newMilestone, department: e.target.value as Department})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Lead Operations">Lead Operations</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsAddMilestoneModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
