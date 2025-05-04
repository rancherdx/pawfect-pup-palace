
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <ScrollArea className="h-full w-full">{children}</ScrollArea>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
