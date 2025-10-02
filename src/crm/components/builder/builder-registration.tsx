// src/components/builder/builder-registration.tsx

import { builder } from "@builder.io/react";
import * as BuilderComponents from "./registry";

/**
 * Registers custom CRM components with Builder.io
 * so they can be used inside the visual editor.
 */
export function registerBuilderComponents() {
  try {
    // Example: register SidebarLayout globally
    if (BuilderComponents.SidebarLayout) {
      builder.registerComponent(BuilderComponents.SidebarLayout as any, {
        name: "SidebarLayout",
        inputs: [
          {
            name: "children",
            type: "uiBlocks",
            defaultValue: [],
          },
        ],
      });
    }

    // Add other components as needed
    if (BuilderComponents.CrmHeader) {
      builder.registerComponent(BuilderComponents.CrmHeader as any, {
        name: "CrmHeader",
        inputs: [
          {
            name: "title",
            type: "string",
            defaultValue: "CRM Header",
          },
        ],
      });
    }
  } catch (err) {
    console.error("builder-registration failed:", err);
  }
}

// Run immediately so components are ready in Builder.io
registerBuilderComponents();
