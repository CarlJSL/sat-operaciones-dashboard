"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useAuthStore } from "@/features/auth/store/authStore";
import { usuarioService } from "@/shared/services/usuario.service";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
//import logoHeroka from "@/assets/logos/logo-heroca.png";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  // 1. Cargamos el menú desde el backend
  const { data: serverMenus, isLoading } = useQuery({
    queryKey: [
      "loadMenu",
      user?.id || user?.username,
      user?.role || user?.rolNombre,
    ],
    queryFn: usuarioService.loadMenu,
    enabled: isAuthenticated,
  });

  // 2. Mapeamos la data al formato de NavMain
  const dynamicNavMain = React.useMemo(() => {
    if (!serverMenus) return [];

    // Mapeo rudimentario de iconos "Material" a Lucide

    return serverMenus.map((menuItem) => {
      // Intentamos igualar el string con el map, si no, Circle
      const lucideIconName = menuItem.icono || "Circle";
      const IconComponent = (LucideIcons[
        lucideIconName as keyof typeof LucideIcons
      ] || LucideIcons.Circle) as LucideIcons.LucideIcon;

      return {
        title: menuItem.title || menuItem.text,
        url: menuItem.to || "#",
        icon: IconComponent,
        items: menuItem.children?.map((sub) => ({
          title: sub.title || sub.text,
          url: sub.to || "#",
        })),
      };
    });
  }, [serverMenus]);

  // Mapeamos el usuario real de la store a la forma que espera el componente NavUser
  const navUserProps = {
    name: user?.nombre || user?.username || t("common.user"),
    email: user?.rolNombre || "-",
    avatar: "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent hover:text-sidebar-foreground">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LucideIcons.GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sat</span>
                  <span className="truncate text-xs">{t("common.portal")}</span>
                </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="px-4 py-6 space-y-4">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ) : (
          <NavMain items={dynamicNavMain} />
        )}
      </SidebarContent>
      <SidebarFooter className="pt-2">
        <div className="mx-0.5 mb-2 h-px bg-zinc-200" />
        <NavUser user={navUserProps} />
      </SidebarFooter>
    </Sidebar>
  );
}
