"use client";

import React, { useState, useEffect } from "react";

type Tab = "logs" | "scrutineering";

interface TestLog {
  id: string;
  date: string;
  location: string;
  driver: string;
  goals: string;
  feedback: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  checked: boolean;
}

const defaultChecklist: ChecklistItem[] = [
  { id: "c1", category: "Mechanical", label: "Chassis structural integrity visually verified", checked: false },
  { id: "c2", category: "Mechanical", label: "Suspension bolts torque-checked & marked", checked: false },
  { id: "c3", category: "Mechanical", label: "Brake system tested (no leaks, firm pedal)", checked: false },
  { id: "c4", category: "Mechanical", label: "Positive locking mechanisms (safety wire, cotter pins) installed", checked: false },
  { id: "c5", category: "Electrical", label: "Accumulator isolation relays function correctly", checked: false },
  { id: "c6", category: "Electrical", label: "Tractive System Active Light (TSAL) operates properly", checked: false },
  { id: "c7", category: "Electrical", label: "Brake System Plausibility Device (BSPD) tested", checked: false },
  { id: "c8", category: "Electrical", label: "Insulation Monitoring Device (IMD) fault injection passed", checked: false },
  { id: "c9", category: "General", label: "Driver egress test completed (< 5 seconds)", checked: false },
  { id: "c10", category: "General", label: "Fire extinguishers mounted and valid", checked: false },
];

export default function TestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("logs");
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Modal
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    location: "",
    driver: "",
    goals: "",
    feedback: "",
  });

  useEffect(() => {
    const savedLogs = localStorage.getItem("fs_test_logs");
    const savedChecklist = localStorage.getItem("fs_scrutineering");

    if (savedLogs) {
      try { setLogs(JSON.parse(savedLogs)); } catch (e) { setLogs([]); }
    } else {
      setLogs([{ id: "l1", date: "2026-04-15", location: "Circuit de Magny-Cours", driver: "Etienne", goals: "Validation aéro, test d'endurance 20km.", feedback: "La température batterie a atteint 58°C, besoin d'optimiser le refroidissement. Comportement très sain en courbe." }]);
    }

    if (savedChecklist) {
      try { setChecklist(JSON.parse(savedChecklist)); } catch (e) { setChecklist(defaultChecklist); }
    } else {
      setChecklist(defaultChecklist);
    }
    
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fs_test_logs", JSON.stringify(logs));
      localStorage.setItem("fs_scrutineering", JSON.stringify(checklist));
    }
  }, [logs, checklist, isHydrated]);

  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.location) return;

    setLogs([{ ...newLog, id: Math.random().toString(36).substring(7) }, ...logs]);
    setIsAddLogOpen(false);
    setNewLog({ date: new Date().toISOString().split('T')[0], location: "", driver: "", goals: "", feedback: "" });
  };

  const toggleCheck = (id: string) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const categories = Array.from(new Set(checklist.map(c => c.category)));

  return (
    <div className="flex-1 flex flex-col p-8 pt-6 overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Tests & Inspection</h2>
          <p className="text-slate-400 mt-1">Base de données des essais piste et vérifications techniques.</p>
        </div>
      </div>

      <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 mb-6 shrink-0 w-fit">
        <button 
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "logs" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
        >
          Journaux d'Essais (Logs)
        </button>
        <button 
          onClick={() => setActiveTab("scrutineering")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "scrutineering" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
        >
          Scrutineering Checklist
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "logs" ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setIsAddLogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                + Ajouter un rapport d'essai
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {logs.map(log => (
                <div key={log.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{log.location}</h3>
                      <p className="text-sm text-slate-400">Le {new Date(log.date).toLocaleDateString()} &bull; Pilote : <span className="font-medium text-slate-300">{log.driver}</span></p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Objectifs de la session</h4>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{log.goals}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Retours Pilote / Données</h4>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{log.feedback}</p>
                    </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                  <p className="text-slate-500">Aucun rapport d'essai pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden p-6 max-w-4xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">Checklist d'Inspection Technique</h3>
              <p className="text-sm text-slate-400">Vérifications obligatoires avant toute compétition ou essai dynamique.</p>
              
              <div className="mt-4 bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Progression globale</span>
                <span className="text-lg font-bold text-blue-400">
                  {Math.round((checklist.filter(c => c.checked).length / checklist.length) * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-8">
              {categories.map(cat => (
                <div key={cat}>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">{cat}</h4>
                  <div className="space-y-3">
                    {checklist.filter(c => c.category === cat).map(item => (
                      <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                          <input 
                            type="checkbox" 
                            checked={item.checked} 
                            onChange={() => toggleCheck(item.id)}
                            className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded bg-slate-900 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors cursor-pointer"
                          />
                          <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className={`text-sm select-none transition-colors ${item.checked ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAddLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Nouveau Rapport d'Essai</h3>
            <form onSubmit={handleAddLogSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Lieu / Circuit *</label>
                  <input type="text" required value={newLog.location} onChange={e => setNewLog({...newLog, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                  <input type="date" required value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Pilote(s)</label>
                <input type="text" value={newLog.driver} onChange={e => setNewLog({...newLog, driver: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Objectifs de la session</label>
                <textarea rows={3} value={newLog.goals} onChange={e => setNewLog({...newLog, goals: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none" placeholder="Ex: Vérifier le refroidissement, tester l'appui aéro..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Retours Pilote / Données Capteurs</label>
                <textarea rows={4} value={newLog.feedback} onChange={e => setNewLog({...newLog, feedback: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none" placeholder="Observations, problèmes rencontrés, datas..." />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAddLogOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
