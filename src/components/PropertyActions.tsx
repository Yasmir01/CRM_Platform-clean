"use client";

import React from "react";
import { useRBAC } from "@/hooks/useRBAC";

export default function PropertyActions({ onAdd }: { onAdd?: () => void }) {
  const canCreateProperty = useRBAC("property:write");

  if (!canCreateProperty) return null;

  return (
    <div className="flex gap-2">
      <button onClick={onAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Property
      </button>
    </div>
  );
}
