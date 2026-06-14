import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()
  const { t } = useTranslation()
  const currentUrl = `${location.pathname}${location.search}`
  const [openTitle, setOpenTitle] = React.useState<string | null>(null)

  const activeItemWithChildren = items.find(
    (item) => item.items?.length && (item.isActive || item.items.some((sub) => currentUrl === sub.url || location.pathname === sub.url))
  )
  React.useEffect(() => {
    if (activeItemWithChildren && openTitle !== activeItemWithChildren.title) {
      setOpenTitle(activeItemWithChildren.title)
    }
  }, [activeItemWithChildren?.title])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("common.menu")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isItemActive =
            currentUrl === item.url ||
            location.pathname === item.url ||
            item.items?.some((sub) => currentUrl === sub.url || location.pathname === sub.url)

          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isItemActive}>
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span className="!whitespace-normal !break-words">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              open={openTitle === item.title}
              onOpenChange={(val) => setOpenTitle(val ? item.title : null)}
              className="group/collapsible"
            >
              <SidebarMenuItem  >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={isItemActive && location.pathname === item.url}>
                    {item.icon && <item.icon />}
                    <span className="!whitespace-normal !break-words">{item.title}</span>
                    <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={currentUrl === subItem.url || location.pathname === subItem.url}
                        >
                          <Link to={subItem.url}>
                            <span className="!whitespace-normal !break-words">{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
