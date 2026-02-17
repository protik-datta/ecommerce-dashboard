import React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  LayoutGrid,
  Home,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "#",
      icon: Home,
      isActive: true,
      items: [{ title: "Home", url: "/home" }],
    },
    {
      title: "Category",
      url: "#",
      icon: LayoutGrid,
      isActive: true,
      items: [
        { title: "Add Category", url: "/add-category" },
        { title: "Category List", url: "/category-list" },
      ],
    },

    {
      title: "Product Management",
      url: "#",
      icon: LayoutGrid,
      isActive: true,
      items: [
        { title: "Add Product", url: "/add-category" },
        { title: "Product List", url: "/category-list" },
        { title: "Upload Product Image", url: "/category-list" },
        { title: "Delete Product Image", url: "/category-list" },
      ],
    },
    {
      title: "Order Management",
      url: "#",
      icon: LayoutGrid,
      isActive: true,
      items: [{ title: "Order List", url: "/category-list" }],
    },
  ],
};

export function AppSidebar(props) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
