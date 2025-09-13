import { builder } from "@builder.io/react";
import PropertyLandingPage from "./PropertyLandingPage";
import PropertyLeadForm from "./PropertyLeadForm";

/**
 * Register components with Builder so editors can drag/drop and edit props.
 * This file should be imported once on app start (e.g. in root layout).
 */

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY || "");

// Register landing page
builder.registerComponent(PropertyLandingPage, {
  name: "PropertyLandingPage",
  inputs: [
    {
      name: "property",
      type: "object",
      subFields: [
        { name: "id", type: "string" },
        { name: "title", type: "string" },
        { name: "address", type: "string" },
        { name: "description", type: "string", multiline: true },
        { name: "descriptionHtml", type: "html" },
        { name: "heroImage", type: "file" },
        { name: "images", type: "list" },
        { name: "features", type: "list", subFields: [{ name: "label", type: "string" }] },
      ],
    },
    {
      name: "account",
      type: "object",
      subFields: [
        { name: "name", type: "string" },
        { name: "logoUrl", type: "file" },
        { name: "themeColor", type: "string" },
      ],
    },
    { name: "showLeadForm", type: "boolean", defaultValue: true },
  ],
});

// Register lead form (for embedding standalone)
builder.registerComponent(PropertyLeadForm, {
  name: "PropertyLeadForm",
  inputs: [
    { name: "propertyId", type: "string" },
    { name: "recaptchaSiteKey", type: "string" },
  ],
});
