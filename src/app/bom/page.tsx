"use client";

import React, { useState, useMemo } from "react";
import { useBOM, Part, PartStatus } from "@/contexts/BOMContext";
import { useTasks, Department } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActivity } from "@/contexts/ActivityContext";

type SortBy = "name" | "mass_asc" | "mass_desc" | "cost_asc" | "cost_desc";

export default function BOMPage() {
  const { parts, addPart, updatePart, deletePart } = useBOM();
  const { tasks } = useTasks();
  const { currentUser } = useAuth();
  const { addActivity } = useActivity();
  
  const [departmentFilter, setDepartmentFilter] = useState<Department | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPart, setNewPart] = useState({
    name: "",
    department: "Mechanical" as Department,
    material: "",
    manufacturer: "",
    cost: 0,
    weight: 0,
    quantity: 1,
    status: "Conception" as PartStatus,
    linkedTaskId: "",
  });

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  // Calculate Metrics
  const metrics = useMemo(() => {
    let totalMass = 0;
    let totalCost = 0;
    let piecesCount = 0;

    parts.forEach(p => {
      if (departmentFilter === "All" || p.department === departmentFilter) {
        totalMass += p.weight * p.quantity;
        totalCost += p.cost * p.quantity;
        piecesCount += p.quantity;
      }
    });

    return { totalMass, totalCost, piecesCount };
  }, [parts, departmentFilter]);

  // Filter and Sort
  const displayedParts = useMemo(() => {
    let result = parts.filter(p => departmentFilter === "All" || p.department === departmentFilter);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.manufacturer.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "mass_asc": return (a.weight * a.quantity) - (b.weight * b.quantity);
        case "mass_desc": return (b.weight * b.quantity) - (a.weight * a.quantity);
        case "cost_asc": return (a.cost * a.quantity) - (b.cost * b.quantity);
        case "cost_desc": return (b.cost * b.quantity) - (a.cost * a.quantity);
        case "name":
        default: return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [parts, departmentFilter, searchQuery, sortBy]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPart.name) return;
    
    addPart({
      ...newPart,
      linkedTaskId: newPart.linkedTaskId === "" ? undefined : newPart.linkedTaskId,
    });
    
    addActivity({
      user: currentUser?.name || "Membre",
      action: "a ajouté une nouvelle pièce",
      target: newPart.name,
      status: "ADDED"
    });

    setIsAddModalOpen(false);
    setNewPart({
      name: "",
      department: "Mechanical",
      material: "",
      manufacturer: "",
      cost: 0,
      weight: 0,
      quantity: 1,
      status: "Conception",
      linkedTaskId: "",
    });
  };

  const openEditModal = (part: Part) => {
    setEditingPart({ ...part });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPart) {
      updatePart(editingPart);
      addActivity({
        user: currentUser?.name || "Membre",
        action: "a mis à jour la pièce",
        target: editingPart.name,
        status: "UPDATED"
      });
      setIsEditModalOpen(false);
    }
  };

  const handleDeletePart = () => {
    if (editingPart && window.confirm("Êtes-vous sûr de vouloir supprimer cette pièce ?")) {
      deletePart(editingPart.id);
      setIsEditModalOpen(false);
    }
  };

  const handleStatusChange = (partId: string, newStatus: PartStatus) => {
    const part = parts.find(p => p.id === partId);
    if (part) {
      updatePart({ ...part, status: newStatus });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Bill of Materials (BOM)</h2>
          <p className="text-slate-400 mt-1">Manage parts, costs, and vehicle mass.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          + Ajouter une pièce
        </button>
      </div>

      {/* Metrics Panels */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-sm font-medium text-slate-400">Masse Totale (estimée)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{metrics.totalMass.toFixed(2)}</span>
            <span className="text-slate-500 font-medium">kg</span>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-sm font-medium text-slate-400">Coût Total</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{metrics.totalCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-sm font-medium text-slate-400">Pièces Répertoriées</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{metrics.piecesCount}</span>
            <span className="text-slate-500 font-medium">unités</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-400">Département:</span>
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">Tous</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electrical">Electrical</option>
            <option value="Lead Operations">Lead Operations</option>
          </select>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="Rechercher une pièce..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="name">Trier par: Nom</option>
            <option value="mass_desc">Masse (Décroissant)</option>
            <option value="mass_asc">Masse (Croissant)</option>
            <option value="cost_desc">Coût (Décroissant)</option>
            <option value="cost_asc">Coût (Croissant)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Désignation</th>
                <th className="px-6 py-4 font-medium">Sous-système</th>
                <th className="px-6 py-4 font-medium text-right">Masse (Total)</th>
                <th className="px-6 py-4 font-medium text-right">Coût (Total)</th>
                <th className="px-6 py-4 font-medium text-center">Qté</th>
                <th className="px-6 py-4 font-medium text-center">Statut</th>
                <th className="px-6 py-4 font-medium">Tâche Liée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {displayedParts.length > 0 ? displayedParts.map(part => {
                const linkedTask = part.linkedTaskId ? tasks.find(t => t.id === part.linkedTaskId) : null;
                const totalMass = part.weight * part.quantity;
                const totalCost = part.cost * part.quantity;
                
                return (
                  <tr key={part.id} className="hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => openEditModal(part)}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-200">{part.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{part.material} &bull; {part.manufacturer}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider border ${
                        part.department === "Mechanical" ? "bg-blue-900/30 text-blue-400 border-blue-800/50" :
                        part.department === "Electrical" ? "bg-yellow-900/30 text-yellow-400 border-yellow-800/50" : 
                        "bg-purple-900/30 text-purple-400 border-purple-800/50"
                      }`}>
                        {part.department.split(' ')[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300 font-medium">
                      {totalMass > 0 ? `${totalMass.toFixed(2)} kg` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300 font-medium">
                      {totalCost > 0 ? totalCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400">
                      {part.quantity}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={part.status}
                        onChange={(e) => handleStatusChange(part.id, e.target.value as PartStatus)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border appearance-none text-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-500 ${
                          part.status === "Reçu" ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" :
                          part.status === "Commandé" ? "bg-blue-900/30 text-blue-400 border-blue-800/50" :
                          part.status === "Usiné" ? "bg-indigo-900/30 text-indigo-400 border-indigo-800/50" :
                          part.status === "Achat" ? "bg-amber-900/30 text-amber-400 border-amber-800/50" :
                          "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        <option value="Conception" className="bg-slate-900 text-slate-300">Conception</option>
                        <option value="Achat" className="bg-slate-900 text-slate-300">Achat</option>
                        <option value="Commandé" className="bg-slate-900 text-slate-300">Commandé</option>
                        <option value="Usiné" className="bg-slate-900 text-slate-300">Usiné</option>
                        <option value="Reçu" className="bg-slate-900 text-slate-300">Reçu</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {linkedTask ? (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          <span className="text-xs text-slate-300 truncate max-w-[150px]" title={linkedTask.name}>{linkedTask.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Aucune</span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Aucune pièce trouvée pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-2xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Ajouter une nouvelle pièce</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Désignation *</label>
                    <input type="text" required value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Sous-système (Département) *</label>
                    <select value={newPart.department} onChange={e => setNewPart({...newPart, department: e.target.value as Department})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Lead Operations">Lead Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Statut *</label>
                    <select value={newPart.status} onChange={e => setNewPart({...newPart, status: e.target.value as PartStatus})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                      <option value="Conception">Conception</option>
                      <option value="Achat">Achat</option>
                      <option value="Commandé">Commandé</option>
                      <option value="Usiné">Usiné</option>
                      <option value="Reçu">Reçu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Tâche liée (Optionnel)</label>
                    <select value={newPart.linkedTaskId} onChange={e => setNewPart({...newPart, linkedTaskId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                      <option value="">-- Aucune tâche liée --</option>
                      {tasks.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Matériau</label>
                      <input type="text" value={newPart.material} onChange={e => setNewPart({...newPart, material: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Fabricant</label>
                      <input type="text" value={newPart.manufacturer} onChange={e => setNewPart({...newPart, manufacturer: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Masse unitaire (kg) *</label>
                      <input type="number" step="0.01" min="0" required value={newPart.weight} onChange={e => setNewPart({...newPart, weight: parseFloat(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Coût unitaire (€) *</label>
                      <input type="number" step="0.01" min="0" required value={newPart.cost} onChange={e => setNewPart({...newPart, cost: parseFloat(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Quantité *</label>
                    <input type="number" min="1" required value={newPart.quantity} onChange={e => setNewPart({...newPart, quantity: parseInt(e.target.value, 10)})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
                  Ajouter la pièce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Part Modal */}
      {isEditModalOpen && editingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-2xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Modifier la pièce</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Désignation *</label>
                    <input type="text" required value={editingPart.name} onChange={e => setEditingPart({...editingPart, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Sous-système (Département) *</label>
                    <select value={editingPart.department} onChange={e => setEditingPart({...editingPart, department: e.target.value as Department})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Lead Operations">Lead Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Statut *</label>
                    <select value={editingPart.status} onChange={e => setEditingPart({...editingPart, status: e.target.value as PartStatus})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                      <option value="Conception">Conception</option>
                      <option value="Achat">Achat</option>
                      <option value="Commandé">Commandé</option>
                      <option value="Usiné">Usiné</option>
                      <option value="Reçu">Reçu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Tâche liée (Optionnel)</label>
                    <select value={editingPart.linkedTaskId || ""} onChange={e => setEditingPart({...editingPart, linkedTaskId: e.target.value === "" ? undefined : e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                      <option value="">-- Aucune tâche liée --</option>
                      {tasks.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Matériau</label>
                      <input type="text" value={editingPart.material} onChange={e => setEditingPart({...editingPart, material: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Fabricant</label>
                      <input type="text" value={editingPart.manufacturer} onChange={e => setEditingPart({...editingPart, manufacturer: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Masse unitaire (kg) *</label>
                      <input type="number" step="0.01" min="0" required value={editingPart.weight} onChange={e => setEditingPart({...editingPart, weight: parseFloat(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Coût unitaire (€) *</label>
                      <input type="number" step="0.01" min="0" required value={editingPart.cost} onChange={e => setEditingPart({...editingPart, cost: parseFloat(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Quantité *</label>
                    <input type="number" min="1" required value={editingPart.quantity} onChange={e => setEditingPart({...editingPart, quantity: parseInt(e.target.value, 10) || 1})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-center">
                <button type="button" onClick={handleDeletePart} className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-colors border border-transparent hover:border-red-900/50">
                  Supprimer la pièce
                </button>
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Annuler
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
                    Enregistrer
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
