import * as React from "react"
import {
  Command,
  Home,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  CandyOff,
} from "lucide-react"

import { NavFavorites } from "@/components/nav-favorites"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import logo from "@/assets/images/digitalia-logo.png"

// Logo compact institutionnel
function CompanyLogo() {
  return (
    <div className="flex flex-col items-center p-2 mb-3">
      {/* Logo institutionnel compact */}
      <div className="w-40 mt-4 h-auto rounded-lg flex items-center justify-center mb-1">
        <img src={logo} alt="Logo ERP RH" className="object-contain" />
      </div>
      {/* Titre institutionnel réduit */}
      <div className="text-center">
        <h1 className="text-xs font-medium text-slate-900">RH ERP</h1>
        <p className="text-xs uppercase tracking-wide text-slate-600">ENTERPRISE</p>
      </div>
    </div>
  );
}

// Configuration des données de navigation avec style institutionnel
const data = {
  teams: [
    {
      name: "RH ERP",
      logo: Command,
      plan: "Enterprise",
    }
  ],
  navMain: [
    {
      title: "Recherche",
      url: "#",
      icon: Search,
    },
    {
      title: "Assistant IA",
      url: "#",
      icon: Sparkles,
    },
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "/parametres",
      icon: Settings2,
    },
    {
      title: "Aide & Support",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
  favorites: [
    {
      name: "Congés & Absences",
      url: "/gestion-conges",
      emoji: "🏖️",
    },
    {
      name: "Suivi du Temps",
      url: "/time-tracking",
      emoji: "⏱️",
    },
    {
      name: "Fiches de Paie",
      url: "/fiche-paie",
      emoji: "💼",
    },
    {
      name: "Tableau de Bord",
      url: "/dashboard",
      emoji: "📊",
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="border-r-0 bg-slate-50 shadow-sm transition-all duration-200 ease-in-out"
      style={{
        '--sidebar-width': '15rem',
        '--sidebar-width-mobile': '16rem'
      } as React.CSSProperties}
      {...props}
    >
      <SidebarHeader className="p-2 border-b border-slate-200">
        <CompanyLogo />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <NavFavorites favorites={data.favorites} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
