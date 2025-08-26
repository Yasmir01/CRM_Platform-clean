import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { LocalStorageService } from '../services/LocalStorageService';

// Core entity interfaces
export interface Property {
  id: string;
  name: string;
  address: string;
  type: "Apartment" | "House" | "Condo" | "Townhome" | "Commercial" | "Other";
  customType?: string;
  units: number;
  occupancy: number;
  monthlyRent: number;
  securityDeposit?: number;
  status: "Unlisted" | "Listed" | "Available" | "Occupied" | "Maintenance" | "Pending";
  managerId?: string; // Keep for backwards compatibility
  managerIds: string[]; // Support multiple managers
  tenantIds: string[];
  images: PropertyImage[];
  mainImageId?: string;
  description?: string;
  amenities?: string[];
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  petPolicy?: string;
  petDeposit?: number;
  petFee?: number;
  petDepositRefundable?: boolean;
  maxPetsAllowed?: number;
  parkingSpaces?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  rotation: number;
  isMain: boolean;
  order: number;
}

export interface PropertyManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyIds: string[];
  specialties: string[];
  status: "Active" | "Inactive";
  licenseNumber?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId?: string;
  leaseStart?: string;
  leaseEnd?: string;
  monthlyRent?: number;
  depositAmount?: number;
  status: "Active" | "Inactive" | "Prospective" | "Past Tenant";
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  moveOutDate?: string;
  moveOutReason?: string;
  forwardingAddress?: string;
  securityDepositRefunded?: boolean;
  securityDepositAmount?: number;
  finalCharges?: number;
  previousPropertyId?: string; // Track previous property when moved out
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  type: "Tenant" | "PropertyManager" | "ServiceProvider" | "Prospect" | "Vendor";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  status: "Active" | "Inactive";
  tags: string[];
  notes: string;
  lastContact?: string;
  relatedEntityId?: string; // ID of related tenant, manager, etc.
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  propertyId?: string;
  contactId: string;
  stage: "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";
  value: number;
  probability: number;
  expectedCloseDate: string;
  description: string;
  activities: DealActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface DealActivity {
  id: string;
  type: "Call" | "Email" | "Meeting" | "Note";
  description: string;
  date: string;
  userId: string;
}

export interface Quote {
  id: string;
  dealId: string;
  propertyId: string;
  contactId: string;
  monthlyRent: number;
  securityDeposit: number;
  applicationFee: number;
  petDeposit?: number;
  additionalFees: { name: string; amount: number }[];
  leaseTermMonths: number;
  validUntil: string;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: "Email" | "SMS" | "Social";
  status: "Draft" | "Active" | "Paused" | "Completed";
  targetAudience: string;
  content: string;
  scheduledDate?: string;
  sentDate?: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyGroup {
  id: string;
  name: string;
  description: string;
  propertyIds: string[];
  color: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  category: "Software" | "Hardware" | "Service" | "Add-on" | "Feature";
  description: string;
  price: number;
  pricingModel: "One-time" | "Monthly" | "Yearly" | "Usage-based";
  features: string[];
  status: "Active" | "Draft" | "Discontinued";
  featured: boolean;
  vendor: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: "Basic" | "Premium" | "Enterprise";
  price: number;
  billingCycle: "monthly" | "yearly";
  description: string;
  features: string[];
  maxUsers: number;
  maxProperties: number;
  supportLevel: "Basic" | "Premium" | "Enterprise";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  property: string;
  propertyId: string;
  tenant: string;
  tenantId?: string;
  unit?: string;
  category: "Plumbing" | "Electrical" | "HVAC" | "Appliance" | "General Maintenance" | "Emergency" | "Landscaping" | "Cleaning" | "Other";
  customCategory?: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  status: "Open" | "In Progress" | "Completed" | "Cancelled";
  requestedBy: string;
  assignedTo?: string;
  createdDate: string;
  dueDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  propertyId?: string;
  tenantId?: string;
  contactId?: string;
  dealId?: string;
  category: "General" | "Property" | "Tenant" | "Contact" | "Deal" | "Reminder" | "Important";
  tags: string[];
  isPrivate: boolean;
  isPinned: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "General" | "Maintenance" | "Policy" | "Event" | "Emergency";
  priority: "Low" | "Medium" | "High" | "Urgent";
  targetAudience: "All" | "Tenants" | "Managers" | "Specific";
  targetIds?: string[]; // Specific tenant/manager IDs if targetAudience is "Specific"
  propertyIds?: string[]; // Properties this announcement applies to
  publishDate: string;
  expiryDate?: string;
  isActive: boolean;
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  category: "Lease" | "Insurance" | "Inspection" | "Maintenance" | "Legal" | "Financial" | "Other";
  propertyId?: string;
  tenantId?: string;
  contactId?: string;
  dealId?: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  tags: string[];
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: "ACH" | "Credit Card" | "Check" | "Cash" | "Money Order" | "Wire Transfer" | "Online";
  status: "Completed" | "Pending" | "Failed" | "Refunded" | "Processing";
  description: string;
  propertyId?: string;
  tenantId?: string;
  recordedBy: string;
  transactionId?: string;
  category: "Rent" | "Security Deposit" | "Pet Deposit" | "Late Fee" | "Utilities" | "Maintenance" | "Other";
  dueDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// State interface
export interface CrmState {
  properties: Property[];
  propertyManagers: PropertyManager[];
  tenants: Tenant[];
  contacts: Contact[];
  deals: Deal[];
  quotes: Quote[];
  campaigns: Campaign[];
  propertyGroups: PropertyGroup[];
  marketplaceItems: MarketplaceItem[];
  subscriptionPlans: SubscriptionPlan[];
  workOrders: WorkOrder[];
  notes: Note[];
  announcements: Announcement[];
  documents: Document[];
  payments: Payment[];
  initialized: boolean;
}

// Action types
type CrmAction =
  | { type: 'INITIALIZE_DATA'; payload: Partial<CrmState> }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'ADD_PROPERTY_MANAGER'; payload: PropertyManager }
  | { type: 'UPDATE_PROPERTY_MANAGER'; payload: PropertyManager }
  | { type: 'DELETE_PROPERTY_MANAGER'; payload: string }
  | { type: 'ADD_TENANT'; payload: Tenant }
  | { type: 'UPDATE_TENANT'; payload: Tenant }
  | { type: 'DELETE_TENANT'; payload: string }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'ADD_DEAL'; payload: Deal }
  | { type: 'UPDATE_DEAL'; payload: Deal }
  | { type: 'DELETE_DEAL'; payload: string }
  | { type: 'ADD_QUOTE'; payload: Quote }
  | { type: 'UPDATE_QUOTE'; payload: Quote }
  | { type: 'DELETE_QUOTE'; payload: string }
  | { type: 'ADD_CAMPAIGN'; payload: Campaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: Campaign }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'ADD_PROPERTY_GROUP'; payload: PropertyGroup }
  | { type: 'UPDATE_PROPERTY_GROUP'; payload: PropertyGroup }
  | { type: 'DELETE_PROPERTY_GROUP'; payload: string }
  | { type: 'ADD_MARKETPLACE_ITEM'; payload: MarketplaceItem }
  | { type: 'UPDATE_MARKETPLACE_ITEM'; payload: MarketplaceItem }
  | { type: 'DELETE_MARKETPLACE_ITEM'; payload: string }
  | { type: 'ADD_SUBSCRIPTION_PLAN'; payload: SubscriptionPlan }
  | { type: 'UPDATE_SUBSCRIPTION_PLAN'; payload: SubscriptionPlan }
  | { type: 'DELETE_SUBSCRIPTION_PLAN'; payload: string }
  | { type: 'ADD_WORK_ORDER'; payload: WorkOrder }
  | { type: 'UPDATE_WORK_ORDER'; payload: WorkOrder }
  | { type: 'DELETE_WORK_ORDER'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'UPDATE_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'DELETE_ANNOUNCEMENT'; payload: string }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'DELETE_PAYMENT'; payload: string };

// Initial state with sample data
const initialState: CrmState = {
  properties: [
    {
      id: "1",
      name: "Sunset Apartments",
      address: "123 Main St, Los Angeles, CA 90210",
      type: "Apartment",
      units: 24,
      occupancy: 22,
      monthlyRent: 2500,
      status: "Occupied",
      managerId: "mgr1", // Keep for compatibility
      managerIds: ["mgr1"], // Multiple managers support
      tenantIds: ["tenant1"],
      description: "Beautiful apartment complex with modern amenities and stunning city views.",
      amenities: ["Pool", "Gym", "Parking", "Laundry", "Balcony"],
      squareFootage: 850,
      bedrooms: 2,
      bathrooms: 1,
      petPolicy: "Cats allowed",
      parkingSpaces: 1,
      tags: ["Premium", "Downtown"],
      images: [
        { id: "img1", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400", alt: "Front view", rotation: 0, isMain: true, order: 0 },
        { id: "img2", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400", alt: "Living room", rotation: 0, isMain: false, order: 1 },
        { id: "img3", url: "https://images.unsplash.com/photo-1560449752-263d9c96c0f2?w=400", alt: "Kitchen", rotation: 0, isMain: false, order: 2 },
      ],
      mainImageId: "img1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "590 Hawkins Store Rd",
      address: "590 Hawkins Store Rd, Indianapolis, IN 46227",
      type: "Single Family",
      units: 1,
      occupancy: 1,
      monthlyRent: 1800,
      status: "Occupied",
      managerId: "mgr1",
      managerIds: ["mgr1"],
      tenantIds: ["tenant2"],
      description: "Charming single-family home in a quiet neighborhood with recent renovations.",
      amenities: ["Parking", "Yard", "Storage", "AC"],
      squareFootage: 1200,
      bedrooms: 3,
      bathrooms: 2,
      petPolicy: "Small pets allowed",
      parkingSpaces: 2,
      tags: ["Single Family", "Suburban"],
      images: [
        { id: "img4", url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400", alt: "Front view", rotation: 0, isMain: true, order: 0 },
        { id: "img5", url: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=400", alt: "Living room", rotation: 0, isMain: false, order: 1 },
      ],
      mainImageId: "img4",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Ocean View Condos",
      address: "456 Beach Blvd, Santa Monica, CA 90401",
      type: "Condo",
      units: 8,
      occupancy: 6,
      monthlyRent: 3200,
      status: "Available",
      managerId: "mgr2",
      managerIds: ["mgr2"],
      tenantIds: [],
      description: "Luxury condos with stunning ocean views and premium amenities.",
      amenities: ["Ocean View", "Pool", "Gym", "Valet Parking", "Concierge"],
      squareFootage: 1400,
      bedrooms: 2,
      bathrooms: 2,
      petPolicy: "No pets allowed",
      parkingSpaces: 1,
      tags: ["Luxury", "Ocean View"],
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Garden View Apartments",
      address: "789 Park Ave, Beverly Hills, CA 90210",
      type: "Apartment",
      units: 16,
      occupancy: 14,
      monthlyRent: 2800,
      status: "Occupied",
      managerId: "mgr1",
      managerIds: ["mgr1"],
      tenantIds: [],
      description: "Elegant apartments with beautiful garden views and modern finishes.",
      amenities: ["Garden View", "Pool", "Spa", "Fitness Center"],
      squareFootage: 1200,
      bedrooms: 2,
      bathrooms: 1,
      petPolicy: "Small pets allowed",
      parkingSpaces: 1,
      tags: ["Premium", "Garden View"],
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "5",
      name: "Riverside Townhomes",
      address: "321 River Rd, Portland, OR 97201",
      type: "Townhome",
      units: 12,
      occupancy: 10,
      monthlyRent: 2200,
      status: "Available",
      managerId: "mgr2",
      managerIds: ["mgr2"],
      tenantIds: [],
      description: "Spacious townhomes along the river with private patios.",
      amenities: ["River View", "Private Patio", "Garage", "Storage"],
      squareFootage: 1600,
      bedrooms: 3,
      bathrooms: 2,
      petPolicy: "Pets welcome",
      parkingSpaces: 2,
      tags: ["Townhome", "River View"],
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  propertyManagers: [
    {
      id: "mgr1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      propertyIds: ["1", "2"],
      specialties: ["Residential", "Commercial"],
      status: "Active",
      licenseNumber: "PM123456",
      emergencyContact: "(555) 987-6543",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mgr2",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@example.com",
      phone: "(555) 234-5678",
      propertyIds: [],
      specialties: ["Luxury Properties"],
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  tenants: [
    {
      id: "tenant1",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      phone: "(555) 345-6789",
      propertyId: "1",
      leaseStart: "2024-01-01",
      leaseEnd: "2024-12-31",
      monthlyRent: 2500,
      depositAmount: 2500,
      status: "Active",
      emergencyContact: {
        name: "Michael Johnson",
        phone: "(555) 456-7890",
        relationship: "Spouse"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tenant2",
      firstName: "Michael",
      lastName: "Rodriguez",
      email: "michael.rodriguez@example.com",
      phone: "(555) 678-9012",
      propertyId: "2",
      leaseStart: "2024-02-01",
      leaseEnd: "2025-01-31",
      monthlyRent: 1800,
      depositAmount: 1800,
      status: "Active",
      emergencyContact: {
        name: "Maria Rodriguez",
        phone: "(555) 789-0123",
        relationship: "Spouse"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  contacts: [
    {
      id: "contact1",
      type: "ServiceProvider",
      firstName: "Alex",
      lastName: "Martinez",
      email: "alex@reliableplumbing.com",
      phone: "(555) 111-2222",
      company: "Reliable Plumbing Services",
      status: "Active",
      tags: ["Plumbing", "Emergency", "Licensed"],
      notes: "Specializes in emergency repairs and maintenance",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "contact2",
      type: "ServiceProvider",
      firstName: "Lisa",
      lastName: "Thompson",
      email: "lisa@sparkelectrical.com",
      phone: "(555) 333-4444",
      company: "Spark Electrical Contractors",
      status: "Active",
      tags: ["Electrical", "Certified", "Residential"],
      notes: "Certified electrician with 15+ years experience",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "contact3",
      type: "ServiceProvider",
      firstName: "Carlos",
      lastName: "Rodriguez",
      email: "carlos@coolairhvac.com",
      phone: "(555) 555-6666",
      company: "Cool Air HVAC Solutions",
      status: "Active",
      tags: ["HVAC", "Installation", "Maintenance"],
      notes: "HVAC specialist for residential and commercial properties",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "contact4",
      type: "ServiceProvider",
      firstName: "Jennifer",
      lastName: "Lee",
      email: "jennifer@pristinecleaning.com",
      phone: "(555) 777-8888",
      company: "Pristine Cleaning Services",
      status: "Active",
      tags: ["Cleaning", "Move-out", "Deep Clean"],
      notes: "Professional cleaning for move-outs and deep cleaning",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "contact5",
      type: "ServiceProvider",
      firstName: "Mike",
      lastName: "Wilson",
      email: "mike@wilsonlandscaping.com",
      phone: "(555) 999-0000",
      company: "Wilson Landscaping & Maintenance",
      status: "Active",
      tags: ["Landscaping", "Maintenance", "Seasonal"],
      notes: "Full-service landscaping and property maintenance",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  deals: [],
  quotes: [],
  campaigns: [],
  propertyGroups: [
    {
      id: "1",
      name: "Downtown Portfolio",
      description: "All properties located in downtown area",
      propertyIds: ["1", "3", "4"],
      color: "#2196F3",
      tags: ["downtown", "commercial", "high-value"],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "2",
      name: "Residential Complex A",
      description: "Family-oriented residential properties",
      propertyIds: ["2", "5"],
      color: "#4CAF50",
      tags: ["residential", "family", "suburban"],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "3",
      name: "Luxury Properties",
      description: "High-end luxury properties with premium amenities",
      propertyIds: ["3", "4"],
      color: "#9C27B0",
      tags: ["luxury", "premium", "high-rent"],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ],
  marketplaceItems: [
    {
      id: "item_1",
      name: "Smart Lock System",
      category: "Hardware",
      description: "Advanced keyless entry system for properties",
      price: 299,
      pricingModel: "One-time",
      features: ["Remote Access", "Activity Logs", "Mobile App"],
      status: "Active",
      featured: true,
      vendor: "SecureHome Tech",
      tags: ["Security", "IoT", "Property Management"],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "item_2",
      name: "Maintenance Pro Add-on",
      category: "Software",
      description: "Advanced maintenance scheduling and tracking",
      price: 49,
      pricingModel: "Monthly",
      features: ["Automated Scheduling", "Vendor Management", "Cost Tracking"],
      status: "Active",
      featured: false,
      vendor: "Property Solutions Inc",
      tags: ["Maintenance", "Automation", "Efficiency"],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    }
  ],
  subscriptionPlans: [
    {
      id: "plan_basic",
      name: "Basic Plan",
      type: "Basic",
      price: 79,
      billingCycle: "monthly",
      description: "Essential features for small property managers",
      features: ["Up to 10 properties", "Basic reporting", "Email support"],
      maxUsers: 3,
      maxProperties: 10,
      supportLevel: "Basic",
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "plan_premium",
      name: "Premium Plan",
      type: "Premium",
      price: 149,
      billingCycle: "monthly",
      description: "Advanced features for growing businesses",
      features: ["Up to 50 properties", "Advanced analytics", "Priority support"],
      maxUsers: 10,
      maxProperties: 50,
      supportLevel: "Premium",
      isActive: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    }
  ],
  workOrders: [],
  notes: [],
  announcements: [],
  documents: [],
  payments: [],
  initialized: false,
};

// Reducer
function crmReducer(state: CrmState, action: CrmAction): CrmState {
  switch (action.type) {
    case 'INITIALIZE_DATA':
      return { ...state, ...action.payload, initialized: true };
    
    case 'ADD_PROPERTY':
      return { ...state, properties: [...state.properties, action.payload] };
    
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(p => p.id !== action.payload)
      };
    
    case 'ADD_PROPERTY_MANAGER':
      return { ...state, propertyManagers: [...state.propertyManagers, action.payload] };
    
    case 'UPDATE_PROPERTY_MANAGER':
      return {
        ...state,
        propertyManagers: state.propertyManagers.map(pm => 
          pm.id === action.payload.id ? action.payload : pm
        )
      };
    
    case 'DELETE_PROPERTY_MANAGER':
      return {
        ...state,
        propertyManagers: state.propertyManagers.filter(pm => pm.id !== action.payload)
      };
    
    case 'ADD_TENANT':
      return { ...state, tenants: [...state.tenants, action.payload] };
    
    case 'UPDATE_TENANT':
      return {
        ...state,
        tenants: state.tenants.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
    
    case 'DELETE_TENANT':
      return {
        ...state,
        tenants: state.tenants.filter(t => t.id !== action.payload)
      };
    
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] };
    
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(c => c.id !== action.payload)
      };
    
    case 'ADD_DEAL':
      return { ...state, deals: [...state.deals, action.payload] };
    
    case 'UPDATE_DEAL':
      return {
        ...state,
        deals: state.deals.map(d => 
          d.id === action.payload.id ? action.payload : d
        )
      };
    
    case 'DELETE_DEAL':
      return {
        ...state,
        deals: state.deals.filter(d => d.id !== action.payload)
      };
    
    case 'ADD_QUOTE':
      return { ...state, quotes: [...state.quotes, action.payload] };
    
    case 'UPDATE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map(q => 
          q.id === action.payload.id ? action.payload : q
        )
      };
    
    case 'DELETE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.filter(q => q.id !== action.payload)
      };
    
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };
    
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    
    case 'DELETE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.filter(c => c.id !== action.payload)
      };

    case 'ADD_PROPERTY_GROUP':
      return {
        ...state,
        propertyGroups: [...state.propertyGroups, action.payload]
      };

    case 'UPDATE_PROPERTY_GROUP':
      return {
        ...state,
        propertyGroups: state.propertyGroups.map(pg =>
          pg.id === action.payload.id ? action.payload : pg
        )
      };

    case 'DELETE_PROPERTY_GROUP':
      return {
        ...state,
        propertyGroups: state.propertyGroups.filter(pg => pg.id !== action.payload)
      };

    case 'ADD_MARKETPLACE_ITEM':
      return {
        ...state,
        marketplaceItems: [...state.marketplaceItems, action.payload]
      };

    case 'UPDATE_MARKETPLACE_ITEM':
      return {
        ...state,
        marketplaceItems: state.marketplaceItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };

    case 'DELETE_MARKETPLACE_ITEM':
      return {
        ...state,
        marketplaceItems: state.marketplaceItems.filter(item => item.id !== action.payload)
      };

    case 'ADD_SUBSCRIPTION_PLAN':
      return {
        ...state,
        subscriptionPlans: [...state.subscriptionPlans, action.payload]
      };

    case 'UPDATE_SUBSCRIPTION_PLAN':
      return {
        ...state,
        subscriptionPlans: state.subscriptionPlans.map(plan =>
          plan.id === action.payload.id ? action.payload : plan
        )
      };

    case 'DELETE_SUBSCRIPTION_PLAN':
      return {
        ...state,
        subscriptionPlans: state.subscriptionPlans.filter(plan => plan.id !== action.payload)
      };

    case 'ADD_WORK_ORDER':
      return {
        ...state,
        workOrders: [...state.workOrders, action.payload]
      };

    case 'UPDATE_WORK_ORDER':
      return {
        ...state,
        workOrders: state.workOrders.map(wo =>
          wo.id === action.payload.id ? action.payload : wo
        )
      };

    case 'DELETE_WORK_ORDER':
      return {
        ...state,
        workOrders: state.workOrders.filter(wo => wo.id !== action.payload)
      };

    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...state.notes, action.payload]
      };

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        )
      };

    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload)
      };

    case 'ADD_ANNOUNCEMENT':
      return {
        ...state,
        announcements: [...state.announcements, action.payload]
      };

    case 'UPDATE_ANNOUNCEMENT':
      return {
        ...state,
        announcements: state.announcements.map(announcement =>
          announcement.id === action.payload.id ? action.payload : announcement
        )
      };

    case 'DELETE_ANNOUNCEMENT':
      return {
        ...state,
        announcements: state.announcements.filter(announcement => announcement.id !== action.payload)
      };

    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload]
      };

    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(document =>
          document.id === action.payload.id ? action.payload : document
        )
      };

    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(document => document.id !== action.payload)
      };

    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [...state.payments, action.payload]
      };

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id ? action.payload : payment
        )
      };

    case 'DELETE_PAYMENT':
      return {
        ...state,
        payments: state.payments.filter(payment => payment.id !== action.payload)
      };

    default:
      return state;
  }
}

// Context
export const CrmDataContext = createContext<{
  state: CrmState;
  dispatch: React.Dispatch<CrmAction>;
  // Helper functions
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;
  addPropertyManager: (manager: Omit<PropertyManager, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePropertyManager: (manager: PropertyManager) => void;
  deletePropertyManager: (id: string) => void;
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTenant: (tenant: Tenant) => void;
  moveOutTenant: (tenantId: string, moveOutData: { moveOutDate: string; moveOutReason?: string; forwardingAddress?: string; securityDepositRefunded?: boolean; finalCharges?: number }) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (deal: Deal) => void;
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuote: (quote: Quote) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCampaign: (campaign: Campaign) => void;
  addPropertyGroup: (group: Omit<PropertyGroup, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePropertyGroup: (group: PropertyGroup) => void;
  deletePropertyGroup: (id: string) => void;
  syncEntityToContacts: (entity: PropertyManager | Tenant, type: Contact['type']) => void;
  addMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMarketplaceItem: (item: MarketplaceItem) => void;
  deleteMarketplaceItem: (id: string) => void;
  addSubscriptionPlan: (plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubscriptionPlan: (plan: SubscriptionPlan) => void;
  deleteSubscriptionPlan: (id: string) => void;
  addWorkOrder: (workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkOrder: (workOrder: WorkOrder) => void;
  deleteWorkOrder: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  addDocument: (document: Omit<Document, 'id' | 'uploadedAt'>) => Document;
  updateDocument: (document: Document) => void;
  deleteDocument: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Payment;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
} | undefined>(undefined);

// Provider component
export const CrmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = LocalStorageService.loadAllData();
    if (storedData.properties && storedData.properties.length > 0) {
      dispatch({
        type: 'INITIALIZE_DATA',
        payload: {
          properties: storedData.properties,
          propertyManagers: storedData.managers || [],
          tenants: storedData.tenants || [],
          contacts: storedData.contacts || [],
          deals: storedData.deals || [],
          quotes: storedData.quotes || [],
          campaigns: storedData.campaigns || [],
          workOrders: storedData.workOrders || [],
          notes: storedData.news || [], // Note: notes are loaded from news in LocalStorageService
          announcements: storedData.announcements || [],
          documents: storedData.documents || [],
          initialized: true
        }
      });
    } else {
      dispatch({ type: 'INITIALIZE_DATA', payload: { initialized: true } });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.initialized) {
      LocalStorageService.syncAllData({
        properties: state.properties,
        tenants: state.tenants,
        managers: state.propertyManagers,
        contacts: state.contacts,
        deals: state.deals,
        quotes: state.quotes,
        campaigns: state.campaigns,
        workOrders: state.workOrders,
        news: state.notes, // Note: notes are saved as news in LocalStorageService
        announcements: state.announcements,
        documents: state.documents
      });
    }
  }, [state]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.initialized) {
      LocalStorageService.syncAllData({
        properties: state.properties,
        tenants: state.tenants,
        managers: state.propertyManagers,
        contacts: state.contacts,
        deals: state.deals,
        quotes: state.quotes,
        campaigns: state.campaigns,
        workOrders: state.workOrders,
        news: state.notes, // Note: notes are saved as news in LocalStorageService
        announcements: state.announcements,
        documents: state.documents
      });
    }
  }, [state]);

  // Set up auto-save interval
  useEffect(() => {
    const cleanup = LocalStorageService.enableAutoSave(() => ({
      properties: state.properties,
      tenants: state.tenants,
      managers: state.propertyManagers,
      contacts: state.contacts,
      deals: state.deals,
      quotes: state.quotes,
      campaigns: state.campaigns,
      workOrders: state.workOrders,
      news: state.notes, // Note: notes are saved as news in LocalStorageService
      announcements: state.announcements,
      documents: state.documents
    }), 30000); // Auto-save every 30 seconds

    return cleanup;
  }, [state]);

  // Helper functions
  const addProperty = (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const property: Property = {
      ...propertyData,
      id: Date.now().toString(),
      // New properties start as Unlisted until marked as Listed or a tenant is assigned
      status: propertyData.status === 'Occupied' ? 'Occupied' : 'Unlisted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PROPERTY', payload: property });
  };

  const updateProperty = (property: Property) => {
    const updatedProperty = { ...property, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
  };

  const deleteProperty = (id: string) => {
    dispatch({ type: 'DELETE_PROPERTY', payload: id });
  };

  const addPropertyManager = (managerData: Omit<PropertyManager, 'id' | 'createdAt' | 'updatedAt'>) => {
    const manager: PropertyManager = {
      ...managerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PROPERTY_MANAGER', payload: manager });
    syncEntityToContacts(manager, 'PropertyManager');
  };

  const updatePropertyManager = (manager: PropertyManager) => {
    const updatedManager = { ...manager, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PROPERTY_MANAGER', payload: updatedManager });
    syncEntityToContacts(updatedManager, 'PropertyManager');
  };

  const deletePropertyManager = (id: string) => {
    dispatch({ type: 'DELETE_PROPERTY_MANAGER', payload: id });
  };

  const addTenant = (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tenant: Tenant = {
      ...tenantData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TENANT', payload: tenant });
    syncEntityToContacts(tenant, 'Tenant');

    // Update property status when tenant is assigned
    if (tenant.propertyId && tenant.status === 'Active') {
      const property = state.properties.find(p => p.id === tenant.propertyId);
      if (property) {
        const updatedProperty = {
          ...property,
          status: 'Occupied' as Property['status'],
          occupancy: property.occupancy + 1,
          tenantIds: [...(property.tenantIds || []), tenant.id],
          updatedAt: new Date().toISOString()
        };
        dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
      }
    }
  };

  const updateTenant = (tenant: Tenant) => {
    const updatedTenant = { ...tenant, updatedAt: new Date().toISOString() };
    const previousTenant = state.tenants.find(t => t.id === tenant.id);

    dispatch({ type: 'UPDATE_TENANT', payload: updatedTenant });
    syncEntityToContacts(updatedTenant, 'Tenant');

    // Update property status when tenant status changes
    if (tenant.propertyId && previousTenant) {
      const property = state.properties.find(p => p.id === tenant.propertyId);
      if (property) {
        let newStatus = property.status;
        let newOccupancy = property.occupancy;
        let newTenantIds = property.tenantIds || [];

        // If tenant becomes active and wasn't before
        if (tenant.status === 'Active' && previousTenant.status !== 'Active') {
          newStatus = 'Occupied';
          newOccupancy = Math.max(0, property.occupancy + 1);
          if (!newTenantIds.includes(tenant.id)) {
            newTenantIds = [...newTenantIds, tenant.id];
          }
        }
        // If tenant becomes inactive and was active before
        else if (tenant.status !== 'Active' && previousTenant.status === 'Active') {
          newOccupancy = Math.max(0, property.occupancy - 1);
          newTenantIds = newTenantIds.filter(id => id !== tenant.id);
          // If no active tenants, mark as unlisted (vacant)
          const activeTenantsForProperty = state.tenants.filter(t =>
            t.propertyId === tenant.propertyId &&
            t.status === 'Active' &&
            t.id !== tenant.id
          );
          if (activeTenantsForProperty.length === 0) {
            newStatus = 'Unlisted';
          }
        }

        const updatedProperty = {
          ...property,
          status: newStatus,
          occupancy: newOccupancy,
          tenantIds: newTenantIds,
          updatedAt: new Date().toISOString()
        };
        dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
      }
    }
  };

  const moveOutTenant = (tenantId: string, moveOutData: { moveOutDate: string; moveOutReason?: string; forwardingAddress?: string; securityDepositRefunded?: boolean; finalCharges?: number }) => {
    const tenant = state.tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Update tenant to Past Tenant status and add move-out information
    const updatedTenant: Tenant = {
      ...tenant,
      status: 'Past Tenant',
      moveOutDate: moveOutData.moveOutDate,
      moveOutReason: moveOutData.moveOutReason,
      forwardingAddress: moveOutData.forwardingAddress,
      securityDepositRefunded: moveOutData.securityDepositRefunded,
      finalCharges: moveOutData.finalCharges,
      previousPropertyId: tenant.propertyId, // Store the property they moved out from
      propertyId: undefined, // Remove current property assignment
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPDATE_TENANT', payload: updatedTenant });

    // Update property status when tenant moves out
    if (tenant.propertyId) {
      const property = state.properties.find(p => p.id === tenant.propertyId);
      if (property) {
        const newTenantIds = (property.tenantIds || []).filter(id => id !== tenantId);
        const newOccupancy = Math.max(0, property.occupancy - 1);

        // Check if there are any other active tenants
        const remainingActiveTenants = state.tenants.filter(t =>
          t.propertyId === tenant.propertyId &&
          t.status === 'Active' &&
          t.id !== tenantId
        );

        const updatedProperty = {
          ...property,
          status: remainingActiveTenants.length === 0 ? 'Unlisted' as Property['status'] : property.status,
          occupancy: newOccupancy,
          tenantIds: newTenantIds,
          updatedAt: new Date().toISOString()
        };
        dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
      }
    }
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const contact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CONTACT', payload: contact });
  };

  const updateContact = (contact: Contact) => {
    const updatedContact = { ...contact, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_CONTACT', payload: updatedContact });
  };

  const deleteContact = (id: string) => {
    dispatch({ type: 'DELETE_CONTACT', payload: id });
  };

  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const deal: Deal = {
      ...dealData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_DEAL', payload: deal });
  };

  const updateDeal = (deal: Deal) => {
    const updatedDeal = { ...deal, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_DEAL', payload: updatedDeal });
  };

  const addQuote = (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const quote: Quote = {
      ...quoteData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_QUOTE', payload: quote });
  };

  const updateQuote = (quote: Quote) => {
    const updatedQuote = { ...quote, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_QUOTE', payload: updatedQuote });
  };

  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    const campaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CAMPAIGN', payload: campaign });
  };

  const updateCampaign = (campaign: Campaign) => {
    const updatedCampaign = { ...campaign, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_CAMPAIGN', payload: updatedCampaign });
  };

  const addPropertyGroup = (groupData: Omit<PropertyGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
    const propertyGroup: PropertyGroup = {
      ...groupData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PROPERTY_GROUP', payload: propertyGroup });
  };

  const updatePropertyGroup = (propertyGroup: PropertyGroup) => {
    const updatedGroup = { ...propertyGroup, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PROPERTY_GROUP', payload: updatedGroup });
  };

  const deletePropertyGroup = (id: string) => {
    dispatch({ type: 'DELETE_PROPERTY_GROUP', payload: id });
  };

  const syncEntityToContacts = (entity: any, type: Contact['type']) => {
    const existingContact = state.contacts.find(c => c.relatedEntityId === entity.id);

    const contactData = {
      type,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      company: entity.company || entity.serviceType || '',
      status: entity.status as "Active" | "Inactive",
      tags: [type, ...(entity.specialties || entity.certifications || [])],
      notes: entity.experience ? `${entity.experience} years experience` : '',
      relatedEntityId: entity.id,
    };

    if (existingContact) {
      dispatch({
        type: 'UPDATE_CONTACT',
        payload: {
          ...existingContact,
          ...contactData,
          updatedAt: new Date().toISOString()
        }
      });
    } else {
      addContact(contactData);
    }
  };

  const addMarketplaceItem = (itemData: Omit<MarketplaceItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const marketplaceItem: MarketplaceItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MARKETPLACE_ITEM', payload: marketplaceItem });
  };

  const updateMarketplaceItem = (marketplaceItem: MarketplaceItem) => {
    const updatedItem = { ...marketplaceItem, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_MARKETPLACE_ITEM', payload: updatedItem });
  };

  const deleteMarketplaceItem = (id: string) => {
    dispatch({ type: 'DELETE_MARKETPLACE_ITEM', payload: id });
  };

  const addSubscriptionPlan = (planData: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const subscriptionPlan: SubscriptionPlan = {
      ...planData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_SUBSCRIPTION_PLAN', payload: subscriptionPlan });
  };

  const updateSubscriptionPlan = (subscriptionPlan: SubscriptionPlan) => {
    const updatedPlan = { ...subscriptionPlan, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_SUBSCRIPTION_PLAN', payload: updatedPlan });
  };

  const deleteSubscriptionPlan = (id: string) => {
    dispatch({ type: 'DELETE_SUBSCRIPTION_PLAN', payload: id });
  };

  const addWorkOrder = (workOrderData: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const workOrder: WorkOrder = {
      ...workOrderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_WORK_ORDER', payload: workOrder });
  };

  const updateWorkOrder = (workOrder: WorkOrder) => {
    const updatedWorkOrder = { ...workOrder, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_WORK_ORDER', payload: updatedWorkOrder });
  };

  const deleteWorkOrder = (id: string) => {
    dispatch({ type: 'DELETE_WORK_ORDER', payload: id });
  };

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTE', payload: note });
    return note;
  };

  const updateNote = (note: Note) => {
    const updatedNote = { ...note, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
  };

  const deleteNote = (id: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
  };

  const addAnnouncement = (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
    const announcement: Announcement = {
      ...announcementData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ANNOUNCEMENT', payload: announcement });
  };

  const updateAnnouncement = (announcement: Announcement) => {
    const updatedAnnouncement = { ...announcement, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_ANNOUNCEMENT', payload: updatedAnnouncement });
  };

  const deleteAnnouncement = (id: string) => {
    dispatch({ type: 'DELETE_ANNOUNCEMENT', payload: id });
  };

  // Document functions
  const addDocument = (documentData: Omit<Document, 'id' | 'uploadedAt'>) => {
    const document: Document = {
      ...documentData,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_DOCUMENT', payload: document });
    return document;
  };

  const updateDocument = (document: Document) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: document });
  };

  const deleteDocument = (id: string) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: id });
  };

  // Payment functions
  const addPayment = (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payment: Payment = {
      ...paymentData,
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PAYMENT', payload: payment });
    return payment;
  };

  const updatePayment = (payment: Payment) => {
    const updatedPayment = { ...payment, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PAYMENT', payload: updatedPayment });
  };

  const deletePayment = (id: string) => {
    dispatch({ type: 'DELETE_PAYMENT', payload: id });
  };

  const value = {
    state,
    dispatch,
    addProperty,
    updateProperty,
    deleteProperty,
    addPropertyManager,
    updatePropertyManager,
    deletePropertyManager,
    addTenant,
    updateTenant,
    moveOutTenant,
    addContact,
    updateContact,
    deleteContact,
    addDeal,
    updateDeal,
    addQuote,
    updateQuote,
    addCampaign,
    updateCampaign,
    addPropertyGroup,
    updatePropertyGroup,
    deletePropertyGroup,
    syncEntityToContacts,
    addMarketplaceItem,
    updateMarketplaceItem,
    deleteMarketplaceItem,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    addNote,
    updateNote,
    deleteNote,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addDocument,
    updateDocument,
    deleteDocument,
    addPayment,
    updatePayment,
    deletePayment,
  };

  return (
    <CrmDataContext.Provider value={value}>
      {children}
    </CrmDataContext.Provider>
  );
};

export const useCrmData = () => {
  const context = useContext(CrmDataContext);
  if (context === undefined) {
    throw new Error('useCrmData must be used within a CrmDataProvider');
  }
  return context;
};
