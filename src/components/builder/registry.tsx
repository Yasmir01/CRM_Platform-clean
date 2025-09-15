"use client";
import { Builder } from "@builder.io/react";
import * as BuilderComponents from "./index";

// Keep track of names we've explicitly registered to avoid duplicates
const registered = new Set<string>();

import PlanWrapper from './PlanWrapper';

// Helper to safely register a component when it exists
function safeRegister(component: any, name: string, inputs: any[] = [], wrapWithPlan: boolean = false) {
  if (!component) return;
  try {
    const opts: any = { name, inputs };
    if (wrapWithPlan) {
      opts.wrap = (props: any) => (
        <PlanWrapper allowedPlans={props.allowedPlans}>
          {React.createElement(component as any, props)}
        </PlanWrapper>
      );
    }
    Builder.registerComponent(component, opts);
    registered.add(name);
  } catch (e) {
    // do not crash registration; log for debugging
    // eslint-disable-next-line no-console
    console.warn(`Failed to register Builder component ${name}`, e);
  }
}

// Explicit, opinionated registrations with inputs for better editor experience
safeRegister(BuilderComponents.PropertyHero, "PropertyLandingHero", [
  { name: "headline", type: "string", defaultValue: "Welcome Home" },
  { name: "subheadline", type: "string", defaultValue: "Find your perfect rental property today." },
  { name: "ctaLabel", type: "string", defaultValue: "View Listings" },
  { name: "ctaLink", type: "url", defaultValue: "/properties" },
  { name: "backgroundImage", type: "file", allowedFileTypes: ["jpeg", "png", "webp"] },
], true);

safeRegister(BuilderComponents.PropertyGallery, "PropertyLandingGallery", [
  { name: "title", type: "string", defaultValue: "Property Gallery" },
  { name: "images", type: "list", subFields: [{ name: "src", type: "file" }, { name: "alt", type: "string" }] },
], true);

safeRegister(BuilderComponents.PropertyLeadForm, "PropertyLandingContactForm", [
  { name: "title", type: "string", defaultValue: "Contact Us" },
  { name: "submitLabel", type: "string", defaultValue: "Send Message" },
  { name: "successMessage", type: "string", defaultValue: "We\u2019ll get back to you shortly." },
], true);

// Also register the original names so existing pages/components continue to work
safeRegister(BuilderComponents.PropertyHero, "PropertyHero", [
  { name: "title", type: "string" },
  { name: "subtitle", type: "string" },
  { name: "image", type: "file", allowedFileTypes: ["jpeg", "jpg", "png", "webp"] },
  { name: "ctaLabel", type: "string" },
  { name: "ctaUrl", type: "url" },
]);

safeRegister(BuilderComponents.PropertyGallery, "PropertyGallery", [
  { name: "images", type: "list", subFields: [{ name: "src", type: "file" }] },
]);

safeRegister(BuilderComponents.PropertyLeadForm, "PropertyLeadForm", [
  { name: "propertyId", type: "string" },
  { name: "submitLabel", type: "string" },
]);

// PropertyLandingPage: composite component
safeRegister(BuilderComponents.PropertyLandingPage, "PropertyLandingPage", [
  { name: "property", type: "object" },
  { name: "account", type: "object" },
  { name: "showLeadForm", type: "boolean" },
]);

// Lead Pipeline Board
safeRegister(BuilderComponents.LeadPipelineBoard, "LeadPipelineBoard", [
  { name: "title", type: "string", defaultValue: "Lead Management Board" },
  { name: "stages", type: "list", defaultValue: ["New", "Contacted", "Tour Scheduled", "Application Sent", "Closed"], subFields: [{ name: "stageName", type: "string" }] },
  { name: "showCounts", type: "boolean", defaultValue: true },
]);

// Lead Detail Card
safeRegister(BuilderComponents.LeadDetailCard, "LeadDetailCard", [
  { name: "nameLabel", type: "string", defaultValue: "Lead Name" },
  { name: "emailLabel", type: "string", defaultValue: "Email" },
  { name: "phoneLabel", type: "string", defaultValue: "Phone" },
  { name: "statusLabel", type: "string", defaultValue: "Current Stage" },
  { name: "notesLabel", type: "string", defaultValue: "Notes" },
]);

// Payment History Table
safeRegister(BuilderComponents.PaymentHistoryTable, "PaymentHistoryTable", [
  { name: "title", type: "string", defaultValue: "Payment History" },
  { name: "showFilters", type: "boolean", defaultValue: true },
  { name: "showExport", type: "boolean", defaultValue: true },
]);

// Payment Proration Calculator
safeRegister(BuilderComponents.PaymentProrationCalculator, "PaymentProrationCalculator", [
  { name: "title", type: "string", defaultValue: "Prorated Rent Calculator" },
  { name: "submitLabel", type: "string", defaultValue: "Calculate" },
  { name: "showHelpText", type: "boolean", defaultValue: true },
]);

// Auto-register any remaining components exported from the barrel with empty inputs
Object.entries(BuilderComponents).forEach(([name, component]) => {
  if (!component) return;
  if (registered.has(name)) return;
  safeRegister(component, name, []);
});
