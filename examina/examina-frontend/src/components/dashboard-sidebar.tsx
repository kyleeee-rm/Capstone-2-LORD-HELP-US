import { NavLink } from "react-router-dom";
import {
  Home,
  HelpCircle,
  LayoutDashboard,
  Library,
  Settings,
  BarChart2,
  Search,
  FileText,
  Bell,
  Menu,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="size-4" /> },
  { name: "Questions", href: "/dashboard/questions", icon: <FileText className="size-4" /> },
  { name: "Sheet Scanning", href: "/dashboard/sheet-scanning", icon: <Search className="size-4" /> },
  { name: "Analysis", href: "/dashboard/analysis", icon: <BarChart2 className="size-4" /> },
  { name: "Search", href: "/dashboard/search", icon: <Search className="size-4" /> },
  { name: "Library", href: "/dashboard/library", icon: <Library className="size-4" /> },
  { name: "Reports", href: "/dashboard/reports", icon: <BarChart2 className="size-4" /> },
];

const bottomNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: <Settings className="size-4" /> },
  { name: "Help", href: "/dashboard/help", icon: <HelpCircle className="size-4" /> },
  { name: "Profile", href: "/dashboard/profile", icon: <User className="size-4" /> },
];

const menuIcon = <Menu className="size-6" />;
const menuIconSm = <Menu className="size-4" />;

export default function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Button variant="ghost" size="icon" className="w-full justify-start">
          {menuIcon}
          <span className="text-sm font-medium">Menu</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    isActive={false}
                  >
                    <NavLink to={item.href}>
                      {item.icon}
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    isActive={false}
                  >
                    <NavLink to={item.href}>
                      {item.icon}
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline" className="w-full justify-start gap-2" size="sm">
          {menuIconSm}
          <span>Menu</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}