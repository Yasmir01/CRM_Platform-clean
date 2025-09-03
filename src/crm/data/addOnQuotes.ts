const quotes = [
  {
    id: "quote_addon_1",
    dealId: "addon_2",
    quoteNumber: "AO-2024-001",
    productName: "Power Dialer Pro - Team License",
    customerName: "Michael Chen",
    customerEmail: "m.chen@globalproperties.com",
    items: [
      { id: "1", product: "Power Dialer Pro", description: "Professional dialing system with analytics", quantity: 8, unitPrice: 16.99, total: 135.92, billingCycle: "monthly" },
      { id: "2", product: "Setup & Training", description: "Team onboarding and setup assistance", quantity: 1, unitPrice: 0, total: 0, billingCycle: "one-time" }
    ],
    subtotal: 135.92,
    discount: 15.92,
    total: 120.0,
    status: "Sent",
    validUntil: "2024-02-15",
    createdBy: "Emily Davis",
    dateCreated: "2024-01-24",
    dateModified: "2024-01-24",
    notes: "Team pricing discount applied - special rate for 8+ users",
    trialOffered: true,
    trialDuration: 7
  },
  {
    id: "quote_addon_2",
    dealId: "addon_4",
    quoteNumber: "AO-2024-002",
    productName: "Professional Photography - Premium Package",
    customerName: "Robert Kim",
    customerEmail: "robert@luxurymanagement.com",
    items: [
      { id: "3", product: "Premium Photography Package", description: "40 photos + virtual tour + drone shots per property", quantity: 3, unitPrice: 499.99, total: 1499.97, billingCycle: "one-time" },
      { id: "4", product: "Rush Delivery", description: "24-hour turnaround instead of 48 hours", quantity: 3, unitPrice: 100.0, total: 300.0, billingCycle: "one-time" }
    ],
    subtotal: 1799.97,
    discount: 300.0,
    total: 1499.97,
    status: "Draft",
    validUntil: "2024-02-10",
    createdBy: "Jennifer Adams",
    dateCreated: "2024-01-25",
    dateModified: "2024-01-25",
    notes: "Bulk discount for 3 properties. Rush delivery requested.",
    trialOffered: false
  }
];

export default quotes;
