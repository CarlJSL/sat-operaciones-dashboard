import { Outlet } from 'react-router-dom';
import { AppSidebar } from './shadcn-sidebar/app-sidebar';
import { AppHeader } from './AppHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export const DashboardLayout = () => (
  <SidebarProvider className="h-screen overflow-hidden bg-background md:bg-sidebar">
    <AppSidebar />
    
    <SidebarInset className="min-w-0 overflow-hidden bg-transparent">
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-background">
        
        <AppHeader />
              <main className="flex-1 min-w-0 min-h-0 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
        
      </div>
    </SidebarInset>
  </SidebarProvider>
);
