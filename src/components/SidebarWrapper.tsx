"use client";

import React, { Suspense } from "react";
import { useUser } from "@/hooks/useUser";

const Sidebar = React.lazy(() => import("./Sidebar"));

export default function SidebarWrapper({ email }: { email?: string }) {
  const { user, loading } = useUser(email);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No session found</div>;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Sidebar user={user} />
    </Suspense>
  );
}
