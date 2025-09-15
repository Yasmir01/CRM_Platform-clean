"use client";
import React from "react";
import * as BuilderComponents from "./index";
import PlanWrapper from "@/components/PlanWrapper";
import { PLAN_OPTIONS } from "@/utils/plans";

// Helper to wrap component with PlanWrapper in the builder editor/runtime
function wrapWithPlan(Component: any, props: any) {
  return (
    <PlanWrapper allowedPlans={props.allowedPlans} forceShow={props.forceShow} forceHide={props.forceHide}>
      <Component {...props} />
    </PlanWrapper>
  );
}

function withPlanInputs(baseInputs: any[] = []) {
  return [
    ...baseInputs,
    {
      name: "allowedPlans",
      type: "list",
      subFields: [{ name: "plan", type: "string", enum: PLAN_OPTIONS as any }],
      defaultValue: PLAN_OPTIONS as any,
    },
    { name: "forceShow", type: "boolean", defaultValue: false },
    { name: "forceHide", type: "boolean", defaultValue: false },
  ];
}

(async function registerBuilderComponents() {
  try {
    const mod = await import("@builder.io/react");
    const builder = (mod && (mod.builder || mod.default || mod)) as any;
    if (!builder || !builder.registerComponent) {
      // Builder isn't available in this environment
      // eslint-disable-next-line no-console
      console.warn("@builder.io/react not available — skipping component registration");
      return;
    }

    // Property components
    if (BuilderComponents.PropertyLandingPage) {
      builder.registerComponent(BuilderComponents.PropertyLandingPage as any, {
        name: "PropertyLandingPage",
        inputs: withPlanInputs([
          { name: "property", type: "object" },
          { name: "account", type: "object" },
          { name: "showLeadForm", type: "boolean" },
        ]),
        wrap: (props: any) => wrapWithPlan(BuilderComponents.PropertyLandingPage, props),
      });
    }

    if (BuilderComponents.PropertyHero) {
      builder.registerComponent(BuilderComponents.PropertyHero as any, {
        name: "PropertyLandingHero",
        inputs: withPlanInputs([
          { name: "headline", type: "string", defaultValue: "Welcome Home" },
          { name: "subheadline", type: "string", defaultValue: "Find your perfect rental property today." },
          { name: "ctaLabel", type: "string", defaultValue: "View Listings" },
          { name: "ctaLink", type: "url", defaultValue: "/properties" },
          { name: "backgroundImage", type: "file", allowedFileTypes: ["jpeg", "png", "webp"] },
        ]),
        wrap: (props: any) => wrapWithPlan(BuilderComponents.PropertyHero, props),
      });
    }

    if (BuilderComponents.PropertyGallery) {
      builder.registerComponent(BuilderComponents.PropertyGallery as any, {
        name: "PropertyLandingGallery",
        inputs: withPlanInputs([
          { name: "title", type: "string", defaultValue: "Property Gallery" },
          { name: "images", type: "list", subFields: [{ name: "src", type: "file" }, { name: "alt", type: "string" }] },
        ]),
        wrap: (props: any) => wrapWithPlan(BuilderComponents.PropertyGallery, props),
      });
    }

    if (BuilderComponents.PropertyLeadForm) {
      builder.registerComponent(BuilderComponents.PropertyLeadForm as any, {
        name: "PropertyLandingContactForm",
        inputs: withPlanInputs([
          { name: "title", type: "string", defaultValue: "Contact Us" },
          { name: "submitLabel", type: "string", defaultValue: "Send Message" },
          { name: "successMessage", type: "string", defaultValue: "We’ll get back to you shortly." },
        ]),
        wrap: (props: any) => wrapWithPlan(BuilderComponents.PropertyLeadForm, props),
      });
    }

    // Lead components
    if (BuilderComponents.LeadPipelineBoard) {
      builder.registerComponent(BuilderComponents.LeadPipelineBoard as any, {
        name: "LeadPipelineBoard",
        inputs: withPlanInputs([
          { name: "title", type: "string", defaultValue: "Lead Management Board" },
          { name: "stages", type: "list", defaultValue: ["New", "Contacted", "Tour Scheduled", "Application Sent", "Closed"], subFields: [{ name: "stageName", type: "string" }] },
          { name: "showCounts", type: "boolean", defaultValue: true },
        ]),
        wrap: (props: any) => wrapWithPlan(BuilderComponents.LeadPipelineBoard, props),
      });
    }

    if (BuilderComponents.LeadDetailCard) {
      builder.registerComponent(BuilderComponents.LeadDetailCard as any, {
        name: "LeadDetailCard",
        inputs: withPlanInputs([
          { name: "nameLabel", type: "string", defaultValue: "Lead Name" },
          { name: "emailLabel", type: "string", defaultValue: "Email" },
          { name: "phoneLabel", type: "string", defaultValue: "Phone" },
          { name: "statusLabel", type: "string", defaultValue: "Current Stage" },
          { name: "notesLabel", type: "string", defaultValue: "Notes" },
        ]),
        wrap: (props: any) => wrapWithPlan(BuilderComponents.LeadDetailCard, props),
      });
    }

    // Payment components
    if (BuilderComponents.PaymentHistoryTable) {
      builder.registerComponent(BuilderComponents.PaymentHistoryTable as any, {
        name: "PaymentHistoryTable",
        inputs: withPlanInputs([
          { name: "title", type: "string", defaultValue: "Payment History" },
          { name: "showFilters", type: "boolean", defaultValue: true },
          { name: "showExport", type: "boolean", defaultValue: true },
        ]),
        wrap: (props: any) => wrapWithPlan(BuilderComponents.PaymentHistoryTable, props),
      });
    }

    if (BuilderComponents.PaymentProrationCalculator) {
      builder.registerComponent(BuilderComponents.PaymentProrationCalculator as any, {
        name: "PaymentProrationCalculator",
        inputs: withPlanInputs([
          { name: "title", type: "string", defaultValue: "Prorated Rent Calculator" },
          { name: "submitLabel", type: "string", defaultValue: "Calculate" },
          { name: "showHelpText", type: "boolean", defaultValue: true },
        ]),
        wrap: (props: any) => wrapWithPlan(BuilderComponents.PaymentProrationCalculator, props),
      });
    }

    // Auto-register any other components exported from the barrel with plan inputs by default
    Object.entries(BuilderComponents).forEach(([name, comp]) => {
      if (!comp) return;
      // already registered above
      const registeredNames = [
        'PropertyLandingPage','PropertyLandingHero','PropertyLandingGallery','PropertyLandingContactForm',
        'LeadPipelineBoard','LeadDetailCard','PaymentHistoryTable','PaymentProrationCalculator'
      ];
      if (registeredNames.includes(name)) return;

      try {
        builder.registerComponent(comp as any, {
          name,
          inputs: withPlanInputs([]),
          wrap: (props: any) => wrapWithPlan(comp as any, props),
        });
      } catch (e) {
        // ignore registration failures
        // eslint-disable-next-line no-console
        console.warn('builder auto-register failed for', name, e);
      }
    });

  } catch (e) {
    // @builder.io/react not installed or failed to load — don't crash the app
    // eslint-disable-next-line no-console
    console.warn('Builder registration skipped; @builder.io/react not available', e);
  }
})();

export default null;
