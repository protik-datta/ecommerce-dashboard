import React from "react";
import { Outlet } from "react-router-dom";

import ThemeToggle from "@/components/theme-toggle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Content Area */}
        <SidebarInset className="flex flex-col flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger />
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto pl-5">
            <Outlet />
          </main>
        </SidebarInset>

        {/* Theme Toggle */}
        <ThemeToggle className="fixed top-4 right-4 z-50" />
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
