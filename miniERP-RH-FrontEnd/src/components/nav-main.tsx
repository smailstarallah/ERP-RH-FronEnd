"use client"

import { type LucideIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}) {
  return (
    <SidebarMenu className="space-y-1">
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={item.isActive}
            className={`h-8 px-2 py-2 rounded text-sm font-medium transition-all duration-200 ease-in-out ${item.isActive
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-blue-50 hover:text-blue-600 text-slate-700"
              }`}
          >
            <a href={item.url} className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
