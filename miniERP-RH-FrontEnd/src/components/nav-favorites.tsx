import React from "react"
import {
  MoreHorizontal
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
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
