"use client";
import { Builder } from "@builder.io/react";
import * as BuilderComponents from "./index";

// Keep track of names we've explicitly registered to avoid duplicates
const registered = new Set<string>();

// Helper to safely register a component when it exists
function safeRegister(component: any, name: string, inputs: any[] = []) {
  if (!component) return;
  try {
    Builder.registerComponent(component, { name, inputs });
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
]);

safeRegister(BuilderComponents.PropertyGallery, "PropertyLandingGallery", [
  { name: "title", type: "string", defaultValue: "Property Gallery" },
  { name: "images", type: "list", subFields: [{ name: "src", type: "file" }, { name: "alt", type: "string" }] },
]);

safeRegister(BuilderComponents.PropertyLeadForm, "PropertyLandingContactForm", [
  { name: "title", type: "string", defaultValue: "Contact Us" },
  { name: "submitLabel", type: "string", defaultValue: "Send Message" },
  { name: "successMessage", type: "string", defaultValue: "We\u2019ll get back to you shortly." },
]);

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

// Auto-register any remaining components exported from the barrel with empty inputs
Object.entries(BuilderComponents).forEach(([name, component]) => {
  if (!component) return;
  if (registered.has(name)) return;
  safeRegister(component, name, []);
});
