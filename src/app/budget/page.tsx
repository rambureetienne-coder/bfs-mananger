"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Department } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";

type PRStatus = "En attente" | "Approuvé" | "Rejeté";

interface PurchaseRequest {
  id: string;
  description: string;
  link: string;
  price: number;
  department: Department;
  requestedBy: string;
  status: PRStatus;
  date: string;
}

const TOTAL_BUDGET = 45000;

export default function BudgetPage() {
  const { currentUser } = useAuth();
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPR, setNewPR] = useState({
    description: "",
    link: "",
    price: 0,
    department: "Mechanical" as Department,
  });

  useEffect(() => {
    const saved = localStorage.getItem("fs_budget");
    if (saved) {
      try {
        setPrs(JSON.parse(saved));
      } catch (e) {
        setPrs([]);
      }
    } else {
      setPrs([
        { id: "pr1", description: "Ohlins TTX25 Dampers", link: "https://ohlins.com", price: 3200, department: "Mechanical", requestedBy: "Sarah", status: "Approuvé", date: new Date().toISOString() },
        { id: "pr2", description: "PCB Fabrication batch", link: "https://jlcpcb.com", price: 450, department: "Electrical", requestedBy: "Alex", status: "En attente", date: new Date().toISOString() },
      ]);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fs_budget", JSON.stringify(prs));
    }
  }, [prs, isHydrated]);

  const { spent, pending, remaining } = useMemo(() => {
    let spent = 0;
    let pending = 0;
    prs.forEach(pr => {
      if (pr.status === "Approuvé") spent += pr.price;
      if (pr.status === "En attente") pending += pr.price;
    });
    return { spent, pending, remaining: TOTAL_BUDGET - spent };
  }, [prs]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPR.description || newPR.price <= 0) return;

    const request: PurchaseRequest = {
      ...newPR,
      id: Math.random().toString(36).substring(7),
      requestedBy: currentUser?.name || "Unknown",
      status: "En attente",
      date: new Date().toISOString(),
    };

    setPrs([request, ...prs]);
    setIsAddModalOpen(false);
    setNewPR({ description: "", link: "", price: 0, department: "Mechanical" });
  };

  const updateStatus = (id: string, status: PRStatus) => {
    setPrs(prs.map(pr => pr.id === id ? { ...pr, status } : pr));
  };

  return (
    <div className="flex-1 flex flex-col p-8 pt-6 overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Budget & Achats</h2>
          <p className="text-slate-400 mt-1">Gérez les demandes d'achats (PR) et suivez les dépenses.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          + Nouvelle Demande d'Achat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <p className="text-sm font-medium text-slate-400">Budget Global</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{TOTAL_BUDGET.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 bg-red-500 w-full" style={{ width: `${(spent / TOTAL_BUDGET) * 100}%` }}></div>
          <p className="text-sm font-medium text-slate-400">Dépenses (Approuvées)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-400">{spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 bg-emerald-500 w-full" style={{ width: `${(remaining / TOTAL_BUDGET) * 100}%` }}></div>
          <p className="text-sm font-medium text-slate-400">Reste à dépenser</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">{remaining.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{pending.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} en attente de validation</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800/60 bg-slate-900">
          <h3 className="font-semibold text-slate-200">Historique des demandes</h3>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/30 border-b border-slate-800/60 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Département</th>
                <th className="px-6 py-3 font-medium">Demandé par</th>
                <th className="px-6 py-3 font-medium text-right">Montant</th>
                <th className="px-6 py-3 font-medium text-center">Statut</th>
                <th className="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {prs.map(pr => (
                <tr key={pr.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{new Date(pr.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-200">{pr.description}</p>
                    {pr.link && <a href={pr.link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Voir le produit</a>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {pr.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{pr.requestedBy}</td>
                  <td className="px-6 py-4 text-right font-medium text-white">{pr.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                      pr.status === "Approuvé" ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" :
                      pr.status === "Rejeté" ? "bg-red-900/30 text-red-400 border-red-800/50" :
                      "bg-amber-900/30 text-amber-400 border-amber-800/50"
                    }`}>
                      {pr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {pr.status === "En attente" ? (
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => updateStatus(pr.id, "Approuvé")} className="p-1 text-emerald-400 hover:bg-emerald-900/30 rounded" title="Approuver">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <button onClick={() => updateStatus(pr.id, "Rejeté")} className="p-1 text-red-400 hover:bg-red-900/30 rounded" title="Rejeter">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {prs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Aucune demande d'achat enregistrée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Nouvelle Demande d'Achat</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description / Nom de la pièce *</label>
                <input type="text" required value={newPR.description} onChange={e => setNewPR({...newPR, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Montant TTC (€) *</label>
                <input type="number" step="0.01" min="0" required value={newPR.price} onChange={e => setNewPR({...newPR, price: parseFloat(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Département *</label>
                <select value={newPR.department} onChange={e => setNewPR({...newPR, department: e.target.value as Department})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Lead Operations">Lead Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Lien vers le produit (Optionnel)</label>
                <input type="url" value={newPR.link} onChange={e => setNewPR({...newPR, link: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="https://" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">Soumettre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
