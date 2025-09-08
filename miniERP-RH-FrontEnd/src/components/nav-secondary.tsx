import React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: React.ReactNode
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="h-8 px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ease-in-out"
              >
                <a href={item.url} className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.badge && (
                <SidebarMenuBadge className="bg-blue-100 text-blue-800 text-xs font-medium px-1 py-0.5 rounded">
                  {item.badge}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
