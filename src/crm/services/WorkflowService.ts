import TransUnionService, { CreditReportRequest, BackgroundCheckRequest } from './TransUnionService';

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  propertyName: string;
  propertyAddress: string;
  applicationFee: number;
  paymentStatus: "Paid" | "Pending" | "Failed";
  paymentMethod: string;
  status: "New" | "Pending" | "Denied" | "Archived";
  submittedDate: string;
  monthlyIncome: number;
  moveInDate: string;
  notes?: string;
  creditScore?: number;
  backgroundCheck?: "Pending" | "Approved" | "Failed";
  employmentVerification?: "Pending" | "Verified" | "Failed";
}

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "New" | "Contacted" | "Viewed" | "Applied" | "Approved" | "Rejected" | "Archived";
  source: "Website" | "Craigslist" | "Zillow" | "Referral" | "Walk-in" | "Phone" | "Social Media" | "Other";
  interestedProperty?: string;
  dateAdded: string;
  lastContact?: string;
  notes: string;
  creditScore?: number;
  monthlyIncome?: number;
  employment?: string;
  references?: number;
  pets?: boolean;
  moveInDate?: string;
  budget?: {
    min: number;
    max: number;
  };
  priority: "High" | "Medium" | "Low";
  applicationDate?: string;
  assignedAgent?: string;
  tags: string[];
  followUpDate?: string;
  communicationHistory: Array<{
    date: string;
    type: "Email" | "Phone" | "SMS" | "In-Person" | "Other";
    notes: string;
  }>;
}

interface CommunicationPreferences {
  smsEnabled: boolean;
  emailEnabled: boolean;
  phoneEnabled: boolean;
  achOptIn: boolean;
  autoPayEnabled: boolean;
}

interface TenantPaymentInfo {
  bankAccountLast4?: string;
  routingNumber?: string;
  cardLast4?: string;
  cardType?: string;
  autoPayAmount?: number;
  autoPayDate?: number;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  property: string;
  unit?: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  status: "Active" | "Pending" | "Inactive" | "Late Payment";
  emergencyContact: string;
  emergencyPhone: string;
  profilePicture?: string;
  communicationPrefs: CommunicationPreferences;
  paymentInfo?: TenantPaymentInfo;
}

interface WorkflowCallbacks {
  updateProspects: (updateFn: (prospects: Prospect[]) => Prospect[]) => void;
  addTenant: (tenant: Tenant) => void;
  logActivity: (message: string) => void;
}

export class WorkflowService {
  private static instance: WorkflowService;
  private callbacks: WorkflowCallbacks | null = null;

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  registerCallbacks(callbacks: WorkflowCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Handles automatic progression when application status changes
   */
  async handleApplicationStatusChange(application: Application, newStatus: Application["status"], oldStatus: Application["status"]) {
    if (!this.callbacks) {
      console.warn('WorkflowService: No callbacks registered');
      return;
    }

    try {
      // When application moves to "Pending" status - convert to prospect if not already exists
      if (newStatus === "Pending" && oldStatus === "New") {
        await this.createOrUpdateProspectFromApplication(application, "Applied");
        this.callbacks.logActivity(`Application ${application.id} moved to pending review - prospect status updated to Applied`);

        // Trigger TransUnion integration if payment is completed
        await this.handleTransUnionIntegration(application);
      }

      // When application is "Archived" (approved) - progress prospect to tenant
      if (newStatus === "Archived" && oldStatus === "Pending") {
        await this.approveProspectAndCreateTenant(application);
        this.callbacks.logActivity(`Application ${application.id} approved - created tenant record and updated prospect status`);
      }

      // When application is "Denied" - mark prospect as rejected
      if (newStatus === "Denied") {
        await this.rejectProspect(application);
        this.callbacks.logActivity(`Application ${application.id} denied - prospect status updated to Rejected`);
      }

      // When denied application is reconsidered (Denied → Pending)
      if (newStatus === "Pending" && oldStatus === "Denied") {
        await this.reconsiderProspect(application);
        this.callbacks.logActivity(`Application ${application.id} reconsidered - prospect status updated to Applied`);
      }
    } catch (error) {
      console.error('WorkflowService: Error in status progression:', error);
    }
  }

  /**
   * Creates or updates prospect when application status changes
   */
  private async createOrUpdateProspectFromApplication(application: Application, prospectStatus: Prospect["status"]) {
    if (!this.callbacks) return;

    const [firstName, ...lastNameParts] = application.applicantName.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    this.callbacks.updateProspects((prospects) => {
      // Check if prospect already exists by email
      const existingProspectIndex = prospects.findIndex(p => p.email === application.applicantEmail);

      const prospectData: Prospect = {
        id: existingProspectIndex >= 0 ? prospects[existingProspectIndex].id : `prospect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        firstName,
        lastName,
        email: application.applicantEmail,
        phone: application.applicantPhone,
        status: prospectStatus,
        source: "Website", // Default source for applications
        interestedProperty: application.propertyName,
        dateAdded: existingProspectIndex >= 0 ? prospects[existingProspectIndex].dateAdded : new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0],
        notes: application.notes || `Application submitted for ${application.propertyName}`,
        creditScore: application.creditScore,
        monthlyIncome: application.monthlyIncome,
        moveInDate: application.moveInDate,
        priority: "High",
        applicationDate: new Date().toISOString().split('T')[0],
        tags: ["Application Submitted"],
        communicationHistory: existingProspectIndex >= 0 ? prospects[existingProspectIndex].communicationHistory : [
          {
            date: new Date().toISOString().split('T')[0],
            type: "Other" as const,
            notes: `Application submitted for ${application.propertyName} - Application ID: ${application.id}`
          }
        ]
      };

      if (existingProspectIndex >= 0) {
        // Update existing prospect
        const updatedProspects = [...prospects];
        updatedProspects[existingProspectIndex] = {
          ...prospects[existingProspectIndex],
          ...prospectData,
          communicationHistory: [
            ...prospects[existingProspectIndex].communicationHistory,
            {
              date: new Date().toISOString().split('T')[0],
              type: "Other" as const,
              notes: `Application status updated to ${prospectStatus} - Application ID: ${application.id}`
            }
          ]
        };
        return updatedProspects;
      } else {
        // Create new prospect
        return [...prospects, prospectData];
      }
    });
  }

  /**
   * Approves prospect and creates tenant record
   */
  private async approveProspectAndCreateTenant(application: Application) {
    if (!this.callbacks) return;

    // Update prospect status to Approved
    this.callbacks.updateProspects((prospects) => 
      prospects.map(p => 
        p.email === application.applicantEmail
          ? {
              ...p,
              status: "Approved" as const,
              lastContact: new Date().toISOString().split('T')[0],
              communicationHistory: [
                ...p.communicationHistory,
                {
                  date: new Date().toISOString().split('T')[0],
                  type: "Other" as const,
                  notes: `Application approved - Tenant record created for ${application.propertyName}`
                }
              ]
            }
          : p
      )
    );

    // Create tenant record
    const [firstName, ...lastNameParts] = application.applicantName.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Calculate lease dates
    const moveInDate = new Date(application.moveInDate);
    const leaseEndDate = new Date(moveInDate);
    leaseEndDate.setFullYear(leaseEndDate.getFullYear() + 1); // Default 1 year lease

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      firstName,
      lastName,
      email: application.applicantEmail,
      phone: application.applicantPhone,
      property: application.propertyName,
      unit: this.extractUnitFromAddress(application.propertyAddress),
      leaseStart: application.moveInDate,
      leaseEnd: leaseEndDate.toISOString().split('T')[0],
      monthlyRent: this.estimateRentFromIncome(application.monthlyIncome),
      status: "Pending", // Pending until lease is signed
      emergencyContact: "", // To be filled during onboarding
      emergencyPhone: "",
      communicationPrefs: {
        smsEnabled: true,
        emailEnabled: true,
        phoneEnabled: true,
        achOptIn: false,
        autoPayEnabled: false,
      },
    };

    this.callbacks.addTenant(newTenant);
  }

  /**
   * Marks prospect as rejected when application is denied
   */
  private async rejectProspect(application: Application) {
    if (!this.callbacks) return;

    this.callbacks.updateProspects((prospects) => 
      prospects.map(p => 
        p.email === application.applicantEmail
          ? {
              ...p,
              status: "Rejected" as const,
              lastContact: new Date().toISOString().split('T')[0],
              communicationHistory: [
                ...p.communicationHistory,
                {
                  date: new Date().toISOString().split('T')[0],
                  type: "Other" as const,
                  notes: `Application denied for ${application.propertyName} - Application ID: ${application.id}`
                }
              ]
            }
          : p
      )
    );
  }

  /**
   * Updates prospect status when denied application is reconsidered
   */
  private async reconsiderProspect(application: Application) {
    if (!this.callbacks) return;

    this.callbacks.updateProspects((prospects) => 
      prospects.map(p => 
        p.email === application.applicantEmail
          ? {
              ...p,
              status: "Applied" as const,
              lastContact: new Date().toISOString().split('T')[0],
              communicationHistory: [
                ...p.communicationHistory,
                {
                  date: new Date().toISOString().split('T')[0],
                  type: "Other" as const,
                  notes: `Application reconsidered for ${application.propertyName} - Application ID: ${application.id}`
                }
              ]
            }
          : p
      )
    );
  }

  /**
   * Handle TransUnion integration for credit and background checks
   */
  private async handleTransUnionIntegration(application: Application) {
    if (!this.callbacks) return;

    // Only proceed if payment is completed
    if (application.paymentStatus !== "Paid") {
      this.callbacks.logActivity(`TransUnion integration skipped for application ${application.id} - payment not completed`);
      return;
    }

    // Check if we have the necessary applicant data
    if (!application.applicantName || !application.applicantEmail) {
      this.callbacks.logActivity(`TransUnion integration skipped for application ${application.id} - missing applicant information`);
      return;
    }

    try {
      // Parse applicant name
      const [firstName, ...lastNameParts] = application.applicantName.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      // Get additional data from form data if available
      const formData = (application as any).formData || {};
      const dateOfBirth = formData.date_of_birth || formData.birth_date || '';
      const socialSecurityNumber = formData.social_security_number || formData.ssn || '';
      const creditCheckConsent = formData.creditCheckConsent || formData.credit_check_consent || false;
      const backgroundCheckConsent = formData.backgroundCheckConsent || formData.background_check_consent || false;

      // Parse address (try to extract from property address or form data)
      const addressData = this.parseAddress(
        formData.current_address ||
        formData.address ||
        application.propertyAddress ||
        ''
      );

      // Request credit report if consent is given and we have required data
      if (creditCheckConsent && socialSecurityNumber && dateOfBirth) {
        this.callbacks.logActivity(`Requesting credit report for application ${application.id}...`);

        const creditRequest: CreditReportRequest = {
          firstName,
          lastName,
          dateOfBirth,
          socialSecurityNumber,
          currentAddress: addressData,
          email: application.applicantEmail,
          phone: application.applicantPhone || formData.phone || '',
          permissiblePurpose: 'Tenant Screening'
        };

        try {
          const creditResult = await TransUnionService.requestCreditReport(creditRequest);

          if (creditResult.status === 'completed' && creditResult.creditScore) {
            // Update application with credit score
            this.callbacks.updateApplications((applications) =>
              applications.map(app =>
                app.id === application.id
                  ? { ...app, creditScore: creditResult.creditScore }
                  : app
              )
            );

            this.callbacks.logActivity(
              `Credit report completed for application ${application.id} - Score: ${creditResult.creditScore}`
            );
          } else if (creditResult.status === 'pending') {
            this.callbacks.logActivity(
              `Credit report requested for application ${application.id} - Report ID: ${creditResult.reportId}`
            );
          } else {
            this.callbacks.logActivity(
              `Credit report failed for application ${application.id} - ${creditResult.errorMessage || 'Unknown error'}`
            );
          }
        } catch (error) {
          this.callbacks.logActivity(
            `Credit report error for application ${application.id} - ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      } else {
        this.callbacks.logActivity(
          `Credit report skipped for application ${application.id} - ${!creditCheckConsent ? 'no consent' : 'missing required data'}`
        );
      }

      // Request background check if consent is given and we have required data
      if (backgroundCheckConsent && socialSecurityNumber && dateOfBirth) {
        this.callbacks.logActivity(`Requesting background check for application ${application.id}...`);

        const backgroundRequest: BackgroundCheckRequest = {
          firstName,
          lastName,
          dateOfBirth,
          socialSecurityNumber,
          currentAddress: addressData,
          email: application.applicantEmail,
          phone: application.applicantPhone || formData.phone || '',
          searchType: 'standard'
        };

        try {
          const backgroundResult = await TransUnionService.requestBackgroundCheck(backgroundRequest);

          if (backgroundResult.status === 'completed' && backgroundResult.result) {
            // Update application with background check result
            const backgroundStatus = backgroundResult.result === 'clear'
              ? 'Approved'
              : backgroundResult.result === 'failed'
              ? 'Failed'
              : 'Pending';

            this.callbacks.updateApplications((applications) =>
              applications.map(app =>
                app.id === application.id
                  ? { ...app, backgroundCheck: backgroundStatus as "Pending" | "Approved" | "Failed" }
                  : app
              )
            );

            this.callbacks.logActivity(
              `Background check completed for application ${application.id} - Result: ${backgroundResult.result}`
            );
          } else if (backgroundResult.status === 'pending') {
            this.callbacks.logActivity(
              `Background check requested for application ${application.id} - Report ID: ${backgroundResult.reportId}`
            );
          } else {
            this.callbacks.logActivity(
              `Background check failed for application ${application.id} - ${backgroundResult.errorMessage || 'Unknown error'}`
            );
          }
        } catch (error) {
          this.callbacks.logActivity(
            `Background check error for application ${application.id} - ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      } else {
        this.callbacks.logActivity(
          `Background check skipped for application ${application.id} - ${!backgroundCheckConsent ? 'no consent' : 'missing required data'}`
        );
      }

    } catch (error) {
      this.callbacks.logActivity(
        `TransUnion integration error for application ${application.id} - ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse address string into structured format
   */
  private parseAddress(addressString: string) {
    // Simple address parsing - in production, use a proper address parsing service
    const parts = addressString.split(',').map(part => part.trim());

    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] ? parts[2].split(' ')[0] : '',
      zipCode: parts[2] ? parts[2].split(' ').slice(-1)[0] : ''
    };
  }

  /**
   * Utility: Extract unit number from property address
   */
  private extractUnitFromAddress(address: string): string {
    const unitMatch = address.match(/(?:unit|apt|apartment|#)\s*([A-Za-z0-9]+)/i);
    return unitMatch ? unitMatch[1] : '';
  }

  /**
   * Utility: Estimate rent based on income (typically 30% of monthly income)
   */
  private estimateRentFromIncome(monthlyIncome: number): number {
    return Math.round(monthlyIncome * 0.3);
  }
}

export default WorkflowService;
