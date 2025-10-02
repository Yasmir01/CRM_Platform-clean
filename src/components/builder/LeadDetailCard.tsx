import React from "react";

interface LeadDetailCardProps {
  nameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  statusLabel?: string;
  notesLabel?: string;
  data?: any;
}

export default function LeadDetailCard({ nameLabel = "Lead Name", emailLabel = "Email", phoneLabel = "Phone", statusLabel = "Current Stage", notesLabel = "Notes", data = {} }: LeadDetailCardProps) {
  const lead = data.lead || {};
  return (
    <div className="lead-card">
      <div className="lead-card-row"><strong>{nameLabel}:</strong> {lead.name || "—"}</div>
      <div className="lead-card-row"><strong>{emailLabel}:</strong> {lead.email || "—"}</div>
      <div className="lead-card-row"><strong>{phoneLabel}:</strong> {lead.phone || "—"}</div>
      <div className="lead-card-row"><strong>{statusLabel}:</strong> {lead.status || "—"}</div>
      <div className="lead-card-row"><strong>{notesLabel}:</strong> <div className="lead-notes">{lead.notes || "No notes"}</div></div>
    </div>
  );
}
