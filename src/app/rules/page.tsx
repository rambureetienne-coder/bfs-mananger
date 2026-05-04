"use client";

import React, { useState } from "react";

interface Rule {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
}

const mockRules: Rule[] = [
  {
    id: "T 1.1.1",
    category: "General Technical (T)",
    title: "Vehicle Configuration",
    content: "The vehicle must be designed and fabricated in accordance with good engineering practices. It must be an open-wheeled, single-seat, open-cockpit formula style race car.",
    tags: ["Chassis", "General"],
  },
  {
    id: "T 2.1.1",
    category: "General Technical (T)",
    title: "Ground Clearance",
    content: "Ground clearance must be sufficient to prevent any portion of the vehicle, other than the tires, from touching the ground during track events.",
    tags: ["Chassis", "Suspension"],
  },
  {
    id: "T 5.1.1",
    category: "General Technical (T)",
    title: "Helmet Clearance",
    content: "When seated normally, there must be a minimum of 50mm clearance between the top of the driver's helmet and the primary structure.",
    tags: ["Ergonomics", "Safety"],
  },
  {
    id: "EV 4.1.1",
    category: "Electric Vehicles (EV)",
    title: "Tractive System Active Light (TSAL)",
    content: "The TSAL must be colored RED and flash continuously. It must be visible from every angle around the car when the tractive system is active.",
    tags: ["Electrical", "Safety"],
  },
  {
    id: "EV 5.1.1",
    category: "Electric Vehicles (EV)",
    title: "Accumulator Container",
    content: "All tractive system battery cells must be enclosed in an accumulator container made of fire-retardant material. It must withstand impact forces as defined by the rules.",
    tags: ["Electrical", "Battery"],
  },
  {
    id: "EV 6.1.1",
    category: "Electric Vehicles (EV)",
    title: "Insulation Monitoring Device (IMD)",
    content: "An IMD must be installed to continuously monitor the isolation between the tractive system and the chassis. If a fault is detected, the tractive system must shut down immediately.",
    tags: ["Electrical", "Safety"],
  },
  {
    id: "CV 1.1.1",
    category: "Combustion Vehicles (CV)",
    title: "Engine Limitation",
    content: "The engine(s) used to power the vehicle must be four-stroke piston engine(s) with a maximum displacement of 710cc per cycle.",
    tags: ["Powertrain", "Engine"],
  },
  {
    id: "IN 1.1.1",
    category: "Inspection (IN)",
    title: "Scrutineering Process",
    content: "Every vehicle must pass technical inspection before being allowed to practice or compete. The inspection includes mechanical, electrical, tilt, noise/rain, and brake tests.",
    tags: ["Inspection", "General"],
  }
];

export default function RulesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(mockRules.map(r => r.category)))];

  const filteredRules = mockRules.filter(rule => {
    const matchesCategory = selectedCategory === "All" || rule.category === selectedCategory;
    const matchesSearch = 
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      rule.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-8 pt-6 overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Rulebook Wiki</h2>
          <p className="text-slate-400 mt-1">Consultez les règles officielles Formula Student (FSAE).</p>
        </div>
        
        <div className="relative w-72">
          <input 
            type="text" 
            placeholder="Rechercher une règle (ex: EV 4.1)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-6">
        {/* Sidebar Categories */}
        <div className="w-64 flex flex-col shrink-0">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Catégories</h3>
          <div className="space-y-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === cat 
                    ? "bg-blue-600/10 text-blue-400 font-medium" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {cat === "All" ? "Toutes les règles" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rules Content */}
        <div className="flex-1 overflow-y-auto pr-4 space-y-6 pb-8">
          {filteredRules.length > 0 ? (
            filteredRules.map(rule => (
              <div key={rule.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-slate-800 text-blue-400 px-2 py-0.5 rounded text-xs font-bold border border-slate-700">
                        {rule.id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                        {rule.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{rule.title}</h3>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {rule.content}
                </p>

                <div className="flex flex-wrap gap-2">
                  {rule.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
              <p className="text-slate-400">Aucune règle ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
