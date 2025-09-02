import { Package, BarChart3, ShoppingCart, FileText, Settings, Home, Users, Building2 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Movimentações", url: "/movimentacoes", icon: ShoppingCart },
  { title: "Fornecedores", url: "/fornecedores", icon: Building2 },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

const adminItems = [
  { title: "Usuários", url: "/usuarios", icon: Users, requiredRole: "admin" },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isAdmin = profile?.perfil === 'admin';
  const canViewItem = (item: any) => {
    if (!item.requiredRole) return true;
    return item.requiredRole === profile?.perfil;
  };

  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50";

  return (
    <Sidebar className={`border-r bg-gradient-subtle`}>
      <SidebarContent className="p-4">
        <div className="mb-8">
          <h2 className={`font-bold text-xl text-primary ${isCollapsed ? "hidden" : "block"}`}>
            StockControl
          </h2>
          {isCollapsed && (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "hidden" : "block"}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={`${getNavClass({ isActive: isActive(item.url) })} flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth`}
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "hidden" : "block"}>
            {isAdmin ? "Administração" : "Configurações"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {adminItems
                .filter(canViewItem)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`${getNavClass({ isActive: isActive(item.url) })} flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth`}
                      >
                        <item.icon className="w-5 h-5" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}