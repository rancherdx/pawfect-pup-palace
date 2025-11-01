import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PawPrint } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

function AdminLayoutContent() {
  const { open, setOpen } = useSidebar();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar />
      
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 sm:h-16 border-b bg-card flex items-center px-3 sm:px-4 sticky top-0 z-20">
          <SidebarTrigger className="mr-2 sm:mr-4 min-h-[44px] min-w-[44px]" />
          <div className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-xl font-semibold truncate">Admin Dashboard</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AdminLayoutContent />
    </SidebarProvider>
  );
}
