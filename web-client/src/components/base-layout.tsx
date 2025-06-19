import { GlobalHeader } from "./global-header";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { NavigationPanel } from "./navigation-side-bar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Separator } from "../components/ui/separator";
import { ReactNode } from "react";
type BaseLayoutProps = {
  children: ReactNode;
  breadcrumbs: { text: string; href: string }[];
};

export const BaseLayout = ({ children, breadcrumbs }: BaseLayoutProps) => {
  return (
    <div className="h-screen flex flex-col">
      <GlobalHeader />

      <SidebarProvider>
        <NavigationPanel />
        <main className="pt-16 p-4 w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, idx) => (
                  <>
                    {idx < breadcrumbs.length - 1 ? (
                      <>
                        <BreadcrumbItem key={idx} className="hidden md:block">
                          <BreadcrumbLink href={item.href}>
                            {item.text}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </>
                    ) : (
                      <BreadcrumbItem key={idx} className="hidden md:block">
                        <BreadcrumbPage>{item.text}</BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                  </>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {children}
        </main>
      </SidebarProvider>
    </div>
  );
};
