"use client";

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

const links = [
  { name: "Dashboard", href: "/", icon: DashboardIcon },
  { name: "Tâches", href: "/taches", icon: LayoutIcon },
  { name: "Planning", href: "/planning", icon: CalendarIcon },
  { name: "BOM", href: "/bom", icon: BoxIcon },
  { name: "Budget", href: "/budget", icon: DollarSignIcon, isBeta: true },
  { name: "Sponsors", href: "/sponsors", icon: BriefcaseIcon },
  { name: "Tests", href: "/tests", icon: ActivityIcon, isBeta: true },
  { name: "Rules", href: "/rules", icon: BookIcon, isBeta: true },
]

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  
  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 border-r border-slate-800 bg-slate-950 flex flex-col h-screen fixed top-0 left-0 z-40`}>
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} border-b border-slate-800 relative`}>
        {!isCollapsed ? (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <img src="/logo.png" alt="BFS Logo" className="h-6 w-auto shrink-0" />
            BFS-Manager
          </h1>
        ) : (
          <img src="/logo.png" alt="BFS Logo" className="h-6 w-auto shrink-0" />
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-full p-0.5 z-50 flex items-center justify-center h-6 w-6"
        >
          {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              title={isCollapsed ? link.name : undefined}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 opacity-75 shrink-0" />
                {!isCollapsed && <span>{link.name}</span>}
              </div>
              {!isCollapsed && link.isBeta && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-800/50 shrink-0">
                  Bêta
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        {currentUser && (
          <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div 
                className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white shrink-0"
                title={isCollapsed ? currentUser.name : undefined}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-slate-200 truncate">{currentUser.name}</span>
                  <span className="text-xs text-slate-500 truncate">{currentUser.role}</span>
                </div>
              )}
            </div>
            <button 
              onClick={logout}
              title="Switch User"
              className="text-slate-500 hover:text-white transition-colors p-1 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}

function LayoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
}

function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
}
