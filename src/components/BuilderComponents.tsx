// Central export object for Builder.io component registration
// Only include components that exist. Missing components can be added later.

import PaymentHistory from "@/components/tenant/PaymentHistory";
import LeadPipelineBoard from "@/components/builder/LeadPipelineBoard";
import LeadDetailCard from "@/components/builder/LeadDetailCard";
import PaymentHistoryTable from "@/components/builder/PaymentHistoryTable";
import PaymentProrationCalculator from "@/components/builder/PaymentProrationCalculator";
import PropertyLandingPage from "@/components/builder/PropertyLandingPage";
import PropertyHero from "@/components/builder/PropertyHero";
import PropertyGallery from "@/components/builder/PropertyGallery";
import PropertyLeadForm from "@/components/builder/PropertyLeadForm";

// Export a centralized object. Registration code will check for existence
export const BuilderComponents: Record<string, any> = {
  // Tenant
  TenantReminderForm: undefined, // implement when available
  PaymentHistory, // tenant-level payments page
  LeaseUpload: undefined,

  // Shared
  CommunicationLog: undefined,
  NotificationCenter: undefined,

  // Property
  PropertyBranding: undefined,

  // Leads
  LeadManagement: LeadPipelineBoard,

  // Builder-specific components (detailed)
  LeadPipelineBoard,
  LeadDetailCard,

  // Payments
  PaymentHistoryTable,
  PaymentProrationCalculator,

  // Property landing components
  PropertyLandingPage,
  PropertyHero,
  PropertyGallery,
  PropertyLandingContactForm: PropertyLeadForm,
};

export default BuilderComponents;
