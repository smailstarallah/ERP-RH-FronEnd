import React from "react"
import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  StarOff,
  Trash2,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavFavorites({
  favorites,
}: {
  favorites: {
    name: string
    url: string
    emoji: string
    hasNotifications?: boolean
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
        Accès rapide
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {favorites.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className="h-8 px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ease-in-out"
            >
              <a href={item.url} title={item.name} className="flex items-center gap-2 relative">
                <span className="text-sm relative">
                  {item.emoji}
                  {item.hasNotifications && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </span>
                <span className="text-sm font-medium text-slate-700 truncate">{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="w-5 h-5 rounded hover:bg-slate-200 hover:text-slate-700 transition-colors duration-200"
                >
                  <MoreHorizontal className="w-3 h-3" />
                  <span className="sr-only">Plus d'options</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg bg-white border border-slate-200 shadow-sm"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem className="text-sm hover:bg-slate-50">
                  <StarOff className="text-slate-500 w-4 h-4" />
                  <span>Retirer des favoris</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem className="text-sm hover:bg-slate-50">
                  <Link className="text-slate-500 w-4 h-4" />
                  <span>Copier le lien</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm hover:bg-slate-50">
                  <ArrowUpRight className="text-slate-500 w-4 h-4" />
                  <span>Ouvrir dans un nouvel onglet</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem className="text-sm hover:bg-red-50 text-red-600">
                  <Trash2 className="text-red-500 w-4 h-4" />
                  <span>Supprimer</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="h-8 px-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-200">
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-sm">Plus</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
