"use client";

import React, { useState, useMemo } from "react";
import { useSponsors, Sponsor, SponsorStatus } from "@/contexts/SponsorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActivity } from "@/contexts/ActivityContext";

export default function SponsorsPage() {
  const { sponsors, addSponsor, updateSponsor, deleteSponsor } = useSponsors();
  const { currentUser } = useAuth();
  const { addActivity } = useActivity();
  
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Sponsor>({
    id: "",
    company: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    status: "Prospection",
    amount: 0,
    lastContactDate: new Date().toISOString().split('T')[0],
    comments: "",
  });

  // Metrics
  const metrics = useMemo(() => {
    let totalAmount = 0;
    let activeCount = 0;
    let negoCount = 0;

    sponsors.forEach(s => {
      if (s.status === "Confirmé") {
        totalAmount += s.amount;
        activeCount++;
      } else if (s.status === "En négociation") {
        negoCount++;
      }
    });

    return { totalAmount, activeCount, negoCount };
  }, [sponsors]);

  const openAddModal = () => {
    setFormData({
      id: "",
      company: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      status: "Prospection",
      amount: 0,
      lastContactDate: new Date().toISOString().split('T')[0],
      comments: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    if (selectedSponsor) {
      setFormData({ ...selectedSponsor });
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateSponsor(formData);
      setSelectedSponsor(formData); // Update selected view
      addActivity({
        user: currentUser?.name || "Membre",
        action: "a mis à jour le sponsor",
        target: formData.company,
        status: "UPDATED"
      });
    } else {
      addSponsor(formData);
      addActivity({
        user: currentUser?.name || "Membre",
        action: "a ajouté le sponsor",
        target: formData.company,
        status: "ADDED"
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (isEditing && window.confirm("Êtes-vous sûr de vouloir supprimer ce sponsor ?")) {
      deleteSponsor(formData.id);
      setSelectedSponsor(null);
      setIsModalOpen(false);
    }
  };

  const getStatusBadge = (status: SponsorStatus) => {
    switch (status) {
      case "Confirmé": return "bg-emerald-900/30 text-emerald-400 border-emerald-800/50";
      case "En négociation": return "bg-blue-900/30 text-blue-400 border-blue-800/50";
      case "Premier contact": return "bg-indigo-900/30 text-indigo-400 border-indigo-800/50";
      case "Prospection": return "bg-slate-800 text-slate-300 border-slate-700";
      case "Perdu": return "bg-red-900/30 text-red-400 border-red-800/50";
      default: return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Main Content */}
      <div className="flex-1 flex flex-col p-8 pt-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Sponsors & Partenaires</h2>
            <p className="text-slate-400 mt-1">Gérez vos relations entreprises et vos financements.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
          >
            + Ajouter un sponsor
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <p className="text-sm font-medium text-slate-400">Montant Confirmé (Perçu)</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{metrics.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <p className="text-sm font-medium text-slate-400">Sponsors Actifs (Confirmés)</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{metrics.activeCount}</span>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <p className="text-sm font-medium text-slate-400">En Négociation</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{metrics.negoCount}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900 sticky top-0 border-b border-slate-800 z-10">
                <tr>
                  <th className="px-6 py-4 font-medium">Entreprise</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium text-center">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Montant</th>
                  <th className="px-6 py-4 font-medium">Dernier contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sponsors.length > 0 ? sponsors.map(sponsor => (
                  <tr 
                    key={sponsor.id} 
                    onClick={() => setSelectedSponsor(sponsor)}
                    className={`transition-colors cursor-pointer ${selectedSponsor?.id === sponsor.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-200">{sponsor.company}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 font-medium">{sponsor.contactName}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(sponsor.status)}`}>
                        {sponsor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300 font-medium">
                      {sponsor.amount > 0 ? sponsor.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(sponsor.lastContactDate).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Aucun sponsor répertorié.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Side Panel */}
      <div className="w-96 border-l border-slate-800 bg-slate-900/30 flex flex-col shrink-0">
        {!selectedSponsor ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <p className="text-slate-500">Cliquer sur un sponsor pour obtenir d'avantage d'informations</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedSponsor.company}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(selectedSponsor.status)}`}>
                  {selectedSponsor.status}
                </span>
              </div>
              <button 
                onClick={openEditModal}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700"
                title="Modifier"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Montant Confirmé</h4>
              <p className="text-2xl font-bold text-white">
                {selectedSponsor.amount > 0 ? selectedSponsor.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '0,00 €'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Informations de Contact</h4>
              <div className="space-y-3 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div>
                  <p className="text-xs text-slate-500">Nom du Contact</p>
                  <p className="text-sm font-medium text-slate-200">{selectedSponsor.contactName || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <a href={`mailto:${selectedSponsor.contactEmail}`} className="text-sm text-blue-400 hover:underline">{selectedSponsor.contactEmail || "Non renseigné"}</a>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Téléphone</p>
                  <a href={`tel:${selectedSponsor.contactPhone}`} className="text-sm text-blue-400 hover:underline">{selectedSponsor.contactPhone || "Non renseigné"}</a>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Dernier Contact le</p>
                  <p className="text-sm text-slate-300">{new Date(selectedSponsor.lastContactDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Contrepartie / Commentaires</h4>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 min-h-[100px]">
                <p className="text-sm text-slate-300 whitespace-pre-wrap">
                  {selectedSponsor.comments || <span className="italic text-slate-500">Aucun commentaire renseigné.</span>}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedSponsor(null)}
              className="w-full py-2 text-sm text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-md border border-slate-800 transition-colors"
            >
              Fermer le panneau
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl w-full max-w-2xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{isEditing ? "Modifier le Sponsor" : "Nouveau Sponsor"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Entreprise *</label>
                    <input type="text" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Statut *</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as SponsorStatus})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                      <option value="Prospection">Prospection</option>
                      <option value="Premier contact">Premier contact</option>
                      <option value="En négociation">En négociation</option>
                      <option value="Confirmé">Confirmé</option>
                      <option value="Perdu">Perdu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Montant Confirmé (€)</label>
                    <input type="number" min="0" step="1" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Date du dernier contact *</label>
                    <input type="date" required value={formData.lastContactDate} onChange={e => setFormData({...formData, lastContactDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nom du Contact</label>
                    <input type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email du Contact</label>
                    <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Téléphone du Contact</label>
                    <input type="tel" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contreparties & Commentaires</label>
                <textarea 
                  rows={4}
                  value={formData.comments} 
                  onChange={e => setFormData({...formData, comments: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="ex: Promesse de logo sur l'aileron, en attente du contrat..."
                />
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-center">
                {isEditing ? (
                  <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-colors border border-transparent hover:border-red-900/50">
                    Supprimer ce sponsor
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Annuler
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
                    {isEditing ? "Enregistrer" : "Ajouter le sponsor"}
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
