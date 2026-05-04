"use client";

import React, { useState } from "react";
import { useTasks, Department, TaskStatus, Task, TaskPriority } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActivity } from "@/contexts/ActivityContext";
import { addDays } from "date-fns";

export default function TachesPage() {
  const { tasks, updateTaskStatus, addTask, updateTask, deleteTask } = useTasks();
  const { users, currentUser } = useAuth();
  const { addActivity } = useActivity();
  const [departmentFilter, setDepartmentFilter] = useState<Department | "All">("All");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("TODO");
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

  // Edit Task Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((t) => 
    departmentFilter === "All" ? true : t.department === departmentFilter
  );

  const columns: { id: TaskStatus; title: string }[] = [
    { id: "TODO", title: "Planned" },
    { id: "IN_PROGRESS", title: "Currently" },
    { id: "REVIEW", title: "Revisions" },
    { id: "DONE", title: "Ended" },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== status) {
        updateTaskStatus(taskId, status);
        addActivity({
          user: currentUser?.name || "Membre",
          action: "a déplacé la tâche",
          target: task.name,
          status: status as any
        });
      }
    }
  };

  const openAddModal = (status: TaskStatus) => {
    setNewTaskStatus(status);
    setNewTask({ ...newTask, name: "", assignedTo: "" });
    setIsAddModalOpen(true);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.name || !newTask.assignedTo) return;

    addTask({
      name: newTask.name,
      start: new Date(newTask.start),
      end: new Date(newTask.end),
      progress: newTaskStatus === "DONE" ? 100 : 0,
      department: newTask.department,
      status: newTaskStatus,
      assignedTo: newTask.assignedTo,
      priority: newTask.priority,
      comments: newTask.comments,
      fileLink: newTask.fileLink,
    });
    addActivity({
      user: currentUser?.name || "Membre",
      action: "a créé la tâche",
      target: newTask.name,
      status: "ADDED"
    });
    setIsAddModalOpen(false);
  };

  const openEditModal = (task: Task) => {
    setEditingTask({ ...task });
    setIsEditModalOpen(true);
  };

  const handleEditTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateTask(editingTask);
      addActivity({
        user: currentUser?.name || "Membre",
        action: "a mis à jour la tâche",
        target: editingTask.name,
        status: "UPDATED"
      });
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteTask = () => {
    if (editingTask) {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
        deleteTask(editingTask.id);
        addActivity({
          user: currentUser?.name || "Membre",
          action: "a supprimé la tâche",
          target: editingTask.name,
          status: "REMOVED"
        });
        setIsEditModalOpen(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Tâches</h2>
          <p className="text-slate-400 mt-1">Gérez et suivez l'avancement de vos tâches.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "kanban" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              Kanban
            </button>
            <button 
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "table" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
            >
              Tableau
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-400">Department:</span>
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Lead Operations">Lead Operations</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="flex-1 grid grid-cols-4 gap-6 overflow-hidden pb-4">
          {columns.map((column) => (
            <div 
              key={column.id} 
              className="flex flex-col bg-slate-900/50 rounded-xl border border-slate-800/60 overflow-hidden h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
                <h3 className="font-semibold text-slate-200">{column.title}</h3>
                <span className="bg-slate-800 text-slate-300 text-xs py-0.5 px-2 rounded-full font-medium">
                  {filteredTasks.filter((t) => t.status === column.id).length}
                </span>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {filteredTasks
                  .filter((t) => t.status === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => openEditModal(task)}
                      className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-slate-500 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="text-sm font-medium text-white break-words">{task.name}</h4>
                        <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider border ${
                          task.department === "Mechanical" ? "bg-blue-900/30 text-blue-400 border-blue-800/50" :
                          task.department === "Electrical" ? "bg-yellow-900/30 text-yellow-400 border-yellow-800/50" : 
                          "bg-purple-900/30 text-purple-400 border-purple-800/50"
                        }`}>
                          {task.department.split(' ')[0]}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-600">
                            {task.assignedTo.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-slate-400">{task.assignedTo}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(task.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                <button 
                  onClick={() => openAddModal(column.id)}
                  className="w-full py-2 flex items-center justify-center text-sm font-medium rounded-md border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800/50 transition-colors"
                >
                  + Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-4 space-y-8">
          {["Mechanical", "Electrical", "Lead Operations"].filter(dept => departmentFilter === "All" || departmentFilter === dept).map(dept => {
            const deptTasks = filteredTasks.filter(t => t.department === dept);
            return (
              <div key={dept} className="bg-slate-900/50 rounded-xl border border-slate-800/60 overflow-hidden">
                <div className="p-4 border-b border-slate-800/60 bg-slate-900 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-200">{dept} Tasks</h3>
                  <span className="bg-slate-800 text-slate-400 text-xs py-0.5 px-2 rounded-full font-medium">{deptTasks.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/30 border-b border-slate-800/60">
                      <tr>
                        <th className="px-6 py-3 font-medium">Nom</th>
                        <th className="px-6 py-3 font-medium">Assigné</th>
                        <th className="px-6 py-3 font-medium text-center">Priorité</th>
                        <th className="px-6 py-3 font-medium text-center">Date</th>
                        <th className="px-6 py-3 font-medium text-center">Statut</th>
                        <th className="px-6 py-3 font-medium">Commentaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptTasks.map(task => (
                        <tr key={task.id} onClick={() => openEditModal(task)} className="border-b border-slate-800/40 hover:bg-slate-800/50 cursor-pointer transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-200">{task.name}</td>
                          <td className="px-6 py-4 text-slate-400">
                            <div className="flex items-center space-x-2">
                              <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-600">
                                {task.assignedTo.charAt(0).toUpperCase()}
                              </div>
                              <span>{task.assignedTo}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${
                              task.priority === "Haute" ? "bg-red-900/30 text-red-400 border-red-800/50" :
                              task.priority === "Basse" ? "bg-slate-800/50 text-slate-400 border-slate-700/50" :
                              "bg-yellow-900/30 text-yellow-400 border-yellow-800/50"
                            }`}>
                              {task.priority || "Moyenne"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-400 text-xs whitespace-nowrap">
                            {new Date(task.start).toLocaleDateString()} &rarr; {new Date(task.end).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${
                              task.status === "DONE" ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" :
                              task.status === "IN_PROGRESS" ? "bg-blue-900/30 text-blue-400 border-blue-800/50" :
                              task.status === "REVIEW" ? "bg-amber-900/30 text-amber-400 border-amber-800/50" :
                              "bg-slate-800/50 text-slate-300 border-slate-700/50"
                            }`}>
                              {columns.find(c => c.id === task.status)?.title || task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs max-w-[200px] truncate" title={task.comments}>
                            {task.comments || "-"}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td 
                          colSpan={6} 
                          onClick={() => { setNewTask({...newTask, department: dept as Department}); openAddModal("TODO"); }}
                          className="px-6 py-4 border-b border-slate-800/40 text-center hover:bg-slate-800/50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center justify-center gap-2 text-slate-500 group-hover:text-blue-400 text-sm font-medium transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            Ajouter une tâche
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Task in {columns.find(c => c.id === newTaskStatus)?.title}</h3>
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

      {/* Edit Task Modal */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-1">Task Details</h3>
            <p className="text-sm text-slate-400 mb-4">View or edit task properties</p>
            
            <form onSubmit={handleEditTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Task Name</label>
                <input 
                  type="text" 
                  required
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({...editingTask, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={editingTask.start ? new Date(new Date(editingTask.start).getTime() - new Date(editingTask.start).getTimezoneOffset() * 60000).toISOString().split('T')[0] : ""}
                    onChange={(e) => setEditingTask({...editingTask, start: new Date(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={editingTask.end ? new Date(new Date(editingTask.end).getTime() - new Date(editingTask.end).getTimezoneOffset() * 60000).toISOString().split('T')[0] : ""}
                    onChange={(e) => setEditingTask({...editingTask, end: new Date(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select 
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({...editingTask, status: e.target.value as TaskStatus})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="TODO">Planned</option>
                  <option value="IN_PROGRESS">Currently</option>
                  <option value="REVIEW">Revisions</option>
                  <option value="DONE">Ended</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                  <select 
                    value={editingTask.department}
                    onChange={(e) => setEditingTask({...editingTask, department: e.target.value as Department})}
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
                    value={editingTask.priority || "Moyenne"}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as TaskPriority})}
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
                  value={editingTask.assignedTo}
                  onChange={(e) => setEditingTask({...editingTask, assignedTo: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>-- Sélectionner un membre --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                  ))}
                  {/* Fallback in case user is deleted but still assigned */}
                  {!users.find(u => u.name === editingTask.assignedTo) && editingTask.assignedTo && (
                    <option value={editingTask.assignedTo}>{editingTask.assignedTo} (Ancien membre)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Lien vers fichier (Optionnel)</label>
                <input 
                  type="url" 
                  value={editingTask.fileLink || ""}
                  onChange={(e) => setEditingTask({...editingTask, fileLink: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Commentaires</label>
                <textarea 
                  rows={3}
                  value={editingTask.comments || ""}
                  onChange={(e) => setEditingTask({...editingTask, comments: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Détails supplémentaires..."
                />
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button 
                  type="button"
                  onClick={handleDeleteTask}
                  className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-colors border border-transparent hover:border-red-900/50"
                >
                  Delete Task
                </button>
                <div className="flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
