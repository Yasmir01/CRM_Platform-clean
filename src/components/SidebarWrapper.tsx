"use client";

import dynamic from "next/dynamic";
import { useUser } from "@/hooks/useUser";

const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });

export default function SidebarWrapper({ email }: { email?: string }) {
  const { user, loading } = useUser(email);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No session found</div>;

  return <Sidebar user={user} />;
}
