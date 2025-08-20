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
