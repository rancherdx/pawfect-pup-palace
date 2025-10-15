import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Dog, ShoppingCart, DollarSign, MessageSquare,
  Settings, ShieldCheck, Code, ChevronDown, ChevronRight,
  Heart, Layers, Receipt, Users, FileText, Globe, Mail,
  Bell, PlugZap, CreditCard, Megaphone
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const adminNavigation = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Puppy Manager",
    icon: Dog,
    items: [
      { title: "Overview", url: "/admin/puppy-manager" },
      { title: "Parents", url: "/admin/puppy-manager/parents", icon: Heart },
      { title: "Litters", url: "/admin/puppy-manager/litters", icon: Layers },
      { title: "Puppies", url: "/admin/puppy-manager/puppies", icon: Dog },
    ],
  },
  {
    title: "Marketing & SEO",
    icon: Megaphone,
    items: [
      { title: "Overview", url: "/admin/marketing" },
      { title: "Website Analytics", url: "/admin/marketing/analytics", icon: Globe },
      { title: "SEO Manager", url: "/admin/marketing/seo", icon: Globe },
      { title: "Blog", url: "/admin/marketing/blog", icon: FileText },
      { title: "Testimonials", url: "/admin/marketing/testimonials", icon: MessageSquare },
    ],
  },
  {
    title: "Adoptions/Orders",
    icon: ShoppingCart,
    items: [
      { title: "Overview", url: "/admin/orders" },
      { title: "Adoptions", url: "/admin/orders/adoptions", icon: Receipt },
      { title: "Products", url: "/admin/orders/products", icon: ShoppingCart },
      { title: "All Orders", url: "/admin/orders/all", icon: Receipt },
    ],
  },
  {
    title: "Financial",
    icon: DollarSign,
    items: [
      { title: "Overview", url: "/admin/financial" },
      { title: "Point of Sale", url: "/admin/financial/pos", icon: ShoppingCart },
      { title: "Transactions", url: "/admin/financial/transactions", icon: DollarSign },
      { title: "Payment Methods", url: "/admin/financial/payment-methods", icon: CreditCard },
    ],
  },
  {
    title: "Messages/Email",
    icon: MessageSquare,
    items: [
      { title: "Overview", url: "/admin/messages" },
      { title: "Live Chat", url: "/admin/messages/chat", icon: MessageSquare },
      { title: "Notifications", url: "/admin/messages/notifications", icon: Bell },
      { title: "Email Templates", url: "/admin/messages/templates", icon: Mail },
      { title: "Email Integration", url: "/admin/messages/integration", icon: PlugZap },
    ],
  },
  {
    title: "General Settings",
    icon: Settings,
    items: [
      { title: "Overview", url: "/admin/settings" },
      { title: "Branding", url: "/admin/settings/branding", icon: FileText },
      { title: "Site Contact", url: "/admin/settings/contact", icon: Mail },
      { title: "PWA Config", url: "/admin/settings/pwa", icon: PlugZap },
      { title: "System", url: "/admin/settings/system", icon: Settings },
    ],
  },
  {
    title: "Security",
    icon: ShieldCheck,
    items: [
      { title: "Overview", url: "/admin/security" },
      { title: "API Keys", url: "/admin/security/api-keys", icon: Code },
      { title: "Audit Logs", url: "/admin/security/logs", icon: FileText },
      { title: "User Roles", url: "/admin/security/roles", icon: Users },
      { title: "Data Deletion", url: "/admin/security/data-deletion", icon: ShieldCheck },
    ],
  },
  {
    title: "Developer Tools",
    icon: Code,
    items: [
      { title: "Swagger UI", url: "/admin/developer/swagger", icon: Code },
      { title: "ReDoc", url: "/admin/developer/redoc", icon: Code },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openSections, setOpenSections] = useState<string[]>(["Puppy Manager"]);

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavigation.map((item) => {
                if (!item.items) {
                  // Single item without submenu
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url!}
                          end
                          className={({ isActive }) =>
                            isActive
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted/50"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Item with submenu
                const isOpen = openSections.includes(item.title);
                return (
                  <Collapsible
                    key={item.title}
                    open={isOpen}
                    onOpenChange={() => toggleSection(item.title)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="hover:bg-muted/50">
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <>
                              <span>{item.title}</span>
                              {isOpen ? (
                                <ChevronDown className="ml-auto h-4 w-4" />
                              ) : (
                                <ChevronRight className="ml-auto h-4 w-4" />
                              )}
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <NavLink
                                  to={subItem.url}
                                  end
                                  className={({ isActive }) =>
                                    isActive
                                      ? "bg-muted text-primary font-medium"
                                      : "hover:bg-muted/50"
                                  }
                                >
                                  {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                  {!isCollapsed && <span>{subItem.title}</span>}
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
