"use client";
import { Builder } from "@builder.io/react";
import { PropertyHero, PropertyGallery, PropertyLeadForm, PropertyLandingPage } from "./index";

// ✅ Register PropertyHero
Builder.registerComponent(PropertyHero, {
  name: "PropertyHero",
  inputs: [
    { name: "title", type: "string" },
    { name: "subtitle", type: "string" },
    {
      name: "image",
      type: "file",
      allowedFileTypes: ["jpeg", "jpg", "png", "webp"],
    },
    { name: "ctaLabel", type: "string" },
    { name: "ctaUrl", type: "url" },
  ],
});

// ✅ Register PropertyGallery
Builder.registerComponent(PropertyGallery, {
  name: "PropertyGallery",
  inputs: [
    {
      name: "images",
      type: "list",
      subFields: [{ name: "src", type: "file" }],
    },
  ],
});

// ✅ Register PropertyLeadForm
Builder.registerComponent(PropertyLeadForm, {
  name: "PropertyLeadForm",
  inputs: [
    { name: "propertyId", type: "string" },
    { name: "submitLabel", type: "string" },
  ],
});
