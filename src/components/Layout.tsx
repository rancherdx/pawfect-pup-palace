
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

const Layout = ({ children, fullWidth = false }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-500">
      <Navbar />
      <main className={`flex-grow ${!fullWidth && "container mx-auto px-4"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
