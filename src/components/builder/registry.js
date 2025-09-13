import PropertyLandingPage from "./PropertyLandingPage";
import PropertyLandingPage from "./PropertyLandingPage";
import PropertyLeadForm from "./PropertyLeadForm";

/**
 * Register components with Builder so editors can drag/drop and edit props.
 * This file should be imported once on app start (e.g. in root layout).
 *
 * We dynamically import @builder.io/react so the dev server doesn't fail when
 * that dependency isn't installed in this environment. If Builder is available
 * the components will be registered; otherwise we silently skip registration.
 */

(async function registerBuilderComponents() {
  try {
    const { builder } = await import("@builder.io/react");

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
  } catch (err) {
    // @builder/io/react not installed — that's fine in this environment.
    // Avoid throwing so dev server stays up.
    // eslint-disable-next-line no-console
    console.warn("Builder not available �� skipping component registration.", err?.message || err);
  }
})();
