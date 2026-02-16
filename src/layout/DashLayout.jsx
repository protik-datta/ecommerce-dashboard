import React from "react";
import { Outlet } from "react-router-dom";

import ThemeToggle from "@/components/theme-toggle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <AppSidebar />

        {/* toggle button */}
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className=""/>
            </div>
          </header>
        </SidebarInset>

        {/* Main content */}
        <main className="mt-17 flex-wrap ">
          <Outlet />
        </main>

        {/* Theme Toggle (fixed on top right) */}
        <ThemeToggle className="fixed top-4 right-4 z-50" />
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
