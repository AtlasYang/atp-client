import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "../components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "../common/constants";

import { LayoutDashboard, Bot, List } from "lucide-react";

export const NavigationPanel = () => {
  const { t } = useTranslation("base", { keyPrefix: "navigation-panel" });
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const items = [
    {
      title: t("dashboard"),
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: t("tool-list"),
      url: "/tool-list",
      icon: List,
    },
    {
      title: t("tool-session"),
      // subItems: toolSessionLinks.map((link) => ({
      //   title: `${link.toolName}(S-${link.sessionId.slice(0, 4)})`,
      //   url: `/tool-input/${link.sessionId}/${link.toolId}`,
      // })),
      url: "/tool-session",
      icon: Bot,
    },
  ];

  return (
    <Sidebar className="fixed top-16 left-0 h-[calc(100vh-64px)] bg-background border-r z-40 overflow-y-auto">
      <SidebarHeader className=" font-bold flex h-16 justify-center border-b px-4">
        {APP_NAME}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-2 ${
                        isActive(item.url) ? "font-semibold text-blue-600" : ""
                      }`}
                    >
                      <item.icon size={16} />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
