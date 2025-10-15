import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PawPrint } from "lucide-react";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 sm:h-16 border-b bg-card flex items-center px-3 sm:px-4 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 sm:mr-4 min-h-11 min-w-11" />
            <div className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-semibold">Admin Dashboard</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
