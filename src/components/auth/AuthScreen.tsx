"use client";

import React, { useState } from "react";
import { useAuth, Role } from "@/contexts/AuthContext";
import { Department } from "@/contexts/TaskContext";

export function AuthScreen() {
  const { users, login, createUser } = useAuth();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Role>("Member");
  const [newDept, setNewDept] = useState<Department>("Mechanical");

  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idToLogin = selectedUserId || users[0]?.id;
    if (idToLogin) {
      login(idToLogin);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createUser(newName, newRole, newDept);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="BFS Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent mb-2">
            BFS-Manager
          </h1>
          <p className="text-slate-400">Select your profile to continue</p>
        </div>

        {!isCreating ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Existing Profile</label>
              <select
                value={selectedUserId || (users.length > 0 ? users[0].id : "")}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.role} ({user.department})
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Continue
            </button>

            <div className="pt-4 border-t border-slate-800">
              <button 
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full py-3 flex items-center justify-center text-sm font-medium rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-colors"
              >
                + Create New Member
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input 
                type="text" 
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="Member">Member</option>
                <option value="Lead">Lead</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
              <select 
                value={newDept}
                onChange={(e) => setNewDept(e.target.value as Department)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Lead Operations">Lead Operations</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Back
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
