import {
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/authStore";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/app/providers/QueryProvider";
import { LanguageSelector } from "@/shared/components/LanguageSelector";

export const AppHeader = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const today = new Date();
  const formattedDate = format(today, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const handleLogout = () => {
    clearAuth();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 px-3 sm:px-6 py-3.5 flex items-center h-14 sm:h-16 shrink-0 gap-1 sm:gap-2 transition-[width,height] ease-linear group-has-data[[collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-zinc-200" />
      </div>
      <div className="flex flex-1 min-w-0 items-center justify-between">
        {/* Bienvenida */}
        <div className="min-w-0 pr-2">
          <p className="text-sm sm:text-base font-semibold text-zinc-900 leading-tight truncate">
            {t("layout.header.welcome", { username: user?.username ?? t("common.user") })}
          </p>
          <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
            {capitalizedDate}
          </p>
        </div>

        {/* Controles derechos */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <LanguageSelector className="hidden sm:inline-flex" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-1 h-auto px-2 py-1.5">
                <Avatar className="size-8">
                  <AvatarFallback>
                    {user?.username?.slice(0, 2).toUpperCase() ?? "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-medium leading-none text-zinc-900">
                    {user?.username ?? "-"}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-none text-zinc-500">
                    {user?.rolNombre ?? "-"}
                  </p>
                </div>
                <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User />
                  {t("layout.header.myProfile")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut />
                  {t("layout.header.logout")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
