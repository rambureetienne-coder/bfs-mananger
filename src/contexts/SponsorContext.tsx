"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type SponsorStatus = "Prospection" | "Premier contact" | "En négociation" | "Confirmé" | "Perdu";

export interface Sponsor {
  id: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: SponsorStatus;
  amount: number;
  lastContactDate: string;
  comments: string;
}

interface SponsorContextType {
  sponsors: Sponsor[];
  addSponsor: (sponsor: Omit<Sponsor, "id">) => void;
  updateSponsor: (sponsor: Sponsor) => void;
  deleteSponsor: (id: string) => void;
}

const mockSponsors: Sponsor[] = [
  {
    id: "s1",
    company: "Dassault Systèmes",
    contactName: "Jean Dupont",
    contactEmail: "jean.dupont@3ds.com",
    contactPhone: "+33 1 23 45 67 89",
    status: "Confirmé",
    amount: 5000,
    lastContactDate: new Date().toISOString().split('T')[0],
    comments: "Licences SolidWorks pour 20 membres + logo sur nez de la voiture.",
  },
  {
    id: "s2",
    company: "Michelin",
    contactName: "Claire Martin",
    contactEmail: "claire.martin@michelin.com",
    contactPhone: "+33 4 73 32 20 00",
    status: "En négociation",
    amount: 1500,
    lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    comments: "Négociation pour 3 sets de pneus slick. En attente de validation du budget marketing.",
  },
  {
    id: "s3",
    company: "Red Bull",
    contactName: "Paul Atreides",
    contactEmail: "sponsoring@redbull.fr",
    contactPhone: "",
    status: "Prospection",
    amount: 0,
    lastContactDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    comments: "Email envoyé, pas encore de réponse.",
  }
];

const SponsorContext = createContext<SponsorContextType | undefined>(undefined);

export function SponsorProvider({ children }: { children: React.ReactNode }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fs_sponsors");
    if (saved) {
      try {
        setSponsors(JSON.parse(saved));
      } catch (e) {
        setSponsors(mockSponsors);
      }
    } else {
      setSponsors(mockSponsors);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("fs_sponsors", JSON.stringify(sponsors));
    }
  }, [sponsors, isHydrated]);

  const addSponsor = (sponsorData: Omit<Sponsor, "id">) => {
    const newSponsor: Sponsor = {
      ...sponsorData,
      id: Math.random().toString(36).substring(7),
    };
    setSponsors([...sponsors, newSponsor]);
  };

  const updateSponsor = (updatedSponsor: Sponsor) => {
    setSponsors(sponsors.map((s) => (s.id === updatedSponsor.id ? updatedSponsor : s)));
  };

  const deleteSponsor = (id: string) => {
    setSponsors(sponsors.filter((s) => s.id !== id));
  };

  return (
    <SponsorContext.Provider value={{ sponsors, addSponsor, updateSponsor, deleteSponsor }}>
      {children}
    </SponsorContext.Provider>
  );
}

export function useSponsors() {
  const context = useContext(SponsorContext);
  if (context === undefined) {
    throw new Error("useSponsors must be used within a SponsorProvider");
  }
  return context;
}
