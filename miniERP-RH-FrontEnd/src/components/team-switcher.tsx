import * as React from "react"
import { ChevronDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit px-3 py-2 hover:bg-slate-100 transition-colors duration-200">
              <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="truncate font-semibold text-slate-800">{activeTeam.name}</span>
                <span className="text-xs text-slate-500 font-medium truncate">{activeTeam.plan}</span>
              </div>
              <ChevronDown className="opacity-60 ml-auto flex-shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 shadow-xl"
            align="start"
            side="bottom"
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
              Système RH
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-3 p-3 hover:bg-slate-50 transition-colors duration-150"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
                  <team.logo className="size-5 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">{team.name}</span>
                  <span className="text-xs text-slate-500">{team.plan}</span>
                </div>
                <DropdownMenuShortcut className="text-slate-400">⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="gap-3 p-3 hover:bg-slate-50 transition-colors duration-150">
              <div className="flex size-8 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                <Plus className="size-4 text-slate-500" />
              </div>
              <div className="font-medium text-slate-600">Ajouter un module</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
