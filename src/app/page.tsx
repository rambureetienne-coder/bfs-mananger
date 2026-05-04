"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTasks } from "@/contexts/TaskContext"
import { useAuth } from "@/contexts/AuthContext"
import { useBOM } from "@/contexts/BOMContext"
import { useActivity } from "@/contexts/ActivityContext"
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function Dashboard() {
  const { tasks } = useTasks();
  const { currentUser } = useAuth();
  const { parts } = useBOM();
  const { activities } = useActivity();

  const [budgetData, setBudgetData] = useState({ spent: 0, pending: 0 });

  useEffect(() => {
    // Load Budget from LocalStorage
    const savedBudget = localStorage.getItem("fs_budget");
    if (savedBudget) {
      try {
        const parsed = JSON.parse(savedBudget);
        let spent = 0, pending = 0;
        parsed.forEach((pr: any) => {
          if (pr.status === "Approuvé") spent += pr.price;
          if (pr.status === "En attente") pending += pr.price;
        });
        setBudgetData({ spent, pending });
      } catch (e) {}
    }
  }, []);

  const completedTasks = tasks.filter(t => t.status === "DONE").length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const totalMass = parts.reduce((acc, part) => acc + (part.weight * part.quantity), 0);
  const totalBOMCost = parts.reduce((acc, part) => acc + (part.cost * part.quantity), 0);
  
  const currentSeason = "FS Season 2026"
  const lastUpdate = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.name);

  const TOTAL_BUDGET = 45000;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="text-slate-400 mt-1">
            {currentSeason} &bull; Dernière mise à jour: {lastUpdate}
          </p>
        </div>
      </div>

      {/* Mes Tâches en cours (TOP) */}
      <div className="grid gap-4">
        <Card className="bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Mes Tâches en cours</CardTitle>
          </CardHeader>
          <CardContent>
            {myTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myTasks.filter(t => t.status !== "DONE").map((task) => (
                  <div key={task.id} className="flex flex-col p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-white">{task.name}</span>
                      <Badge variant="outline" className={
                        task.status === "IN_PROGRESS" ? "text-blue-400 border-blue-800 bg-blue-950/30" :
                        task.status === "REVIEW" ? "text-amber-400 border-amber-800 bg-amber-950/30" :
                        "text-slate-400 border-slate-700 bg-slate-800"
                      }>
                        {task.status === "TODO" ? "À faire" :
                         task.status === "IN_PROGRESS" ? "En cours" : "En révision"}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400 mb-4">
                      Échéance: {new Date(task.end).toLocaleDateString("fr-FR", { month: 'long', day: 'numeric' })}
                    </span>
                    <Link href="/taches" className="text-xs text-blue-400 hover:text-blue-300 mt-auto pt-3 border-t border-slate-700/50 block text-center">
                      Voir dans le Tableau &rarr;
                    </Link>
                  </div>
                ))}
                {myTasks.filter(t => t.status !== "DONE").length === 0 && (
                  <div className="col-span-full py-4 text-center text-sm text-slate-500">
                    Toutes vos tâches sont terminées !
                  </div>
                )}
              </div>
            ) : (
               <div className="py-4 text-center text-sm text-slate-500">
                 Aucune tâche ne vous est assignée pour le moment.
               </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tâches */}
        <Link href="/taches">
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-900/50 hover:border-blue-500/50 transition-colors cursor-pointer group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-blue-400 transition-colors">
                Tâches & Progression
              </CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
              <p className="text-xs text-slate-400 mt-1">
                {completedTasks} sur {tasks.length} tâches terminées
              </p>
              <div className="w-full bg-slate-800 h-2 mt-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${completionPercentage}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* BOM */}
        <Link href="/bom">
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-900/50 hover:border-emerald-500/50 transition-colors cursor-pointer group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-emerald-400 transition-colors">
                Masse Totale (Estimée BOM)
              </CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalMass.toFixed(1)} kg</div>
              <p className="text-xs text-slate-400 mt-1">
                {parts.length} pièces &bull; Coût estimé : {totalBOMCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <div className="w-full bg-slate-800 h-2 mt-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${Math.min((totalMass / 300) * 100, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Budget */}
        <Link href="/budget">
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-900/50 hover:border-red-500/50 transition-colors cursor-pointer group">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-red-400 transition-colors">
                Budget Global
              </CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{budgetData.spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
              <p className="text-xs text-slate-400 mt-1">
                Dépensé sur {TOTAL_BUDGET.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <div className="w-full bg-slate-800 h-2 mt-3 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: `${(budgetData.spent / TOTAL_BUDGET) * 100}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4">
        {/* Actions Récentes */}
        <Card className="bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Actions Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 shrink-0">
                    <span className="text-xs font-medium text-slate-300">
                      {activity.user.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-200">
                      {activity.user}{" "}
                      <span className="text-slate-400 font-normal">{activity.action}</span>{" "}
                      <span className="text-white font-semibold">{activity.target}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <div className="ml-auto font-medium pl-4 shrink-0">
                    <Badge variant="outline" className={
                      activity.status === "DONE" || activity.status === "COMPLETED" ? "text-emerald-400 border-emerald-800 bg-emerald-950/30" :
                      activity.status === "PENDING" ? "text-amber-400 border-amber-800 bg-amber-950/30" :
                      "text-blue-400 border-blue-800 bg-blue-950/30"
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
