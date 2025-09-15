"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeleteButtonProps {
  id: string;
  entity: "company" | "contact" | "deal" | "task";
  onDeleted?: () => void;
}

export function DeleteButton({ id, entity, onDeleted }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setTooltip(null);

    try {
      const res = await fetch(`/api/${entity}s/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setTooltip((data && (data.error || data.message)) || "Delete failed");
        setLoading(false);
        return;
      }

      if (data && data.override) {
        setTooltip("Super Admin override applied — dependencies were force deleted.");
      } else {
        setTooltip("Deleted successfully.");
      }

      onDeleted?.();
    } catch (err) {
      setTooltip("Unexpected error while deleting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={handleDelete}
            className="delete-button"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {tooltip ? <p className="delete-tooltip-text">{tooltip}</p> : <p className="delete-tooltip-text">Delete this {entity}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
