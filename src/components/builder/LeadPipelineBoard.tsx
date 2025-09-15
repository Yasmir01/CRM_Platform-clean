import React from "react";

interface Stage { stageName: string }

interface LeadPipelineBoardProps {
  title?: string;
  stages?: (string | Stage)[];
  showCounts?: boolean;
  data?: any;
}

export default function LeadPipelineBoard({ title = "Lead Management Board", stages = ["New", "Contacted", "Tour Scheduled", "Application Sent", "Closed"], showCounts = true }: LeadPipelineBoardProps) {
  const stageItems = Array.isArray(stages) ? stages.map(s => (typeof s === 'string' ? { stageName: s } : s)) : [];

  return (
    <div className="lp-board container">
      <h3 className="lp-board-title">{title}</h3>
      <div className="lp-board-columns">
        {stageItems.map((s, i) => (
          <div key={i} className="lp-column">
            <div className="lp-column-header">
              <span>{s.stageName}</span>
              {showCounts && <span className="lp-count">0</span>}
            </div>
            <div className="lp-column-body">
              <div className="lp-card-placeholder">No leads</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
