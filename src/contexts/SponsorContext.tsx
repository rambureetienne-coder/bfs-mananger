"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  loading: boolean;
  addSponsor: (sponsor: Omit<Sponsor, "id">) => void;
  updateSponsor: (sponsor: Sponsor) => void;
  deleteSponsor: (id: string) => void;
}

const SponsorContext = createContext<SponsorContextType | undefined>(undefined);

export function SponsorProvider({ children }: { children: React.ReactNode }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSponsors = useCallback(async () => {
    try {
      const res = await fetch("/api/sponsors");
      if (res.ok) {
        const data = await res.json();
        setSponsors(data);
      }
    } catch (error) {
      console.error("Failed to fetch sponsors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const addSponsor = async (sponsorData: Omit<Sponsor, "id">) => {
    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sponsorData),
      });
      if (res.ok) {
        const newSponsor = await res.json();
        setSponsors((prev) => [...prev, newSponsor]);
      }
    } catch (error) {
      console.error("Failed to add sponsor:", error);
    }
  };

  const updateSponsor = async (updatedSponsor: Sponsor) => {
    setSponsors((prev) => prev.map((s) => (s.id === updatedSponsor.id ? updatedSponsor : s)));
    try {
      await fetch("/api/sponsors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSponsor),
      });
    } catch (error) {
      console.error("Failed to update sponsor:", error);
      fetchSponsors();
    }
  };

  const deleteSponsor = async (id: string) => {
    setSponsors((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/sponsors?id=${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete sponsor:", error);
      fetchSponsors();
    }
  };

  return (
    <SponsorContext.Provider value={{ sponsors, loading, addSponsor, updateSponsor, deleteSponsor }}>
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
