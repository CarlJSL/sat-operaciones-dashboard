/**
 * VoiceDynamicMenuCommands — bridges server menu data to voice commands.
 *
 * Subscribes to the same serverMenus query used by AppSidebar,
 * auto-registers "ir a {title}" and "{title}" navigation commands
 * for each menu item that has a route, and deregisters when menus
 * change or the component unmounts.
 *
 * Renders nothing (null).
 */
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useVoiceContext } from '../context/voiceContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usuarioService } from '@/shared/services/usuario.service';
import { normalize } from '../services/commandMatcher';
import type { Menu } from '@/domain/roles';

/**
 * Extract flat navigation items from the menu tree.
 * Only includes items that have a `to` route.
 */
function flattenMenuItems(menus: Menu[]): Array<{ title: string; to: string }> {
  const items: Array<{ title: string; to: string }> = [];
  for (const menuItem of menus) {
    const title = menuItem.title || menuItem.text;
    if (menuItem.to && menuItem.to !== '#') {
      items.push({ title, to: menuItem.to });
    }
    if (menuItem.children) {
      for (const child of menuItem.children) {
        const childTitle = child.title || child.text;
        if (child.to && child.to !== '#') {
          items.push({ title: childTitle, to: child.to });
        }
      }
    }
  }
  return items;
}

export function VoiceDynamicMenuCommands() {
  const { registerCommand } = useVoiceContext();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data: serverMenus } = useQuery({
    queryKey: [
      'loadMenu',
      user?.id || user?.username,
      user?.role || user?.rolNombre,
    ],
    queryFn: usuarioService.loadMenu,
    enabled: isAuthenticated,
  });

  const menuItems = useMemo(
    () => (serverMenus ? flattenMenuItems(serverMenus) : []),
    [serverMenus],
  );

  useEffect(() => {
    if (menuItems.length === 0) return;

    const cleanups: (() => void)[] = [];

    for (const item of menuItems) {
      const navigateAction = () => {
        navigate(item.to);
      };

      // Register two patterns: "ir a {title}" and "{title}"
      const patterns = [
        normalize(`ir a ${item.title}`),
        normalize(item.title),
      ];

      const cleanup = registerCommand({
        patterns,
        action: navigateAction,
        scope: 'navegacion',
      });
      cleanups.push(cleanup);
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [menuItems, registerCommand, navigate]);

  return null;
}