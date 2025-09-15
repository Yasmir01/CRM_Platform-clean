import React, { useEffect, useState } from "react";

interface Stage { stageName: string }

interface LeadPipelineBoardProps {
  title?: string;
  stages?: (string | Stage)[];
  showCounts?: boolean;
  data?: any;
}

export default function LeadPipelineBoard({ title = "Lead Management Board", stages = ["New", "Contacted", "Tour Scheduled", "Application Sent", "Closed"], showCounts = true }: LeadPipelineBoardProps) {
  const stageItems = Array.isArray(stages) ? stages.map(s => (typeof s === 'string' ? { stageName: s } : s)) : [];
  const [leadsByStage, setLeadsByStage] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/leads');
        if (!res.ok) throw new Error('fetch failed');
        const json = await res.json();
        if (cancelled) return;
        // group leads into first stage as fallback
        const grouped: Record<string, any[]> = {};
        stageItems.forEach(s => (grouped[s.stageName] = []));
        (json || []).forEach((lead: any) => {
          // try to use lead.stage or lead.status if present
          const stage = lead.stage || lead.status || stageItems[0]?.stageName || 'New';
          if (!grouped[stage]) grouped[stage] = [];
          grouped[stage].push(lead);
        });
        setLeadsByStage(grouped);
      } catch (e) {
        // fallback: empty groups
        const grouped: Record<string, any[]> = {};
        stageItems.forEach(s => (grouped[s.stageName] = []));
        setLeadsByStage(grouped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [JSON.stringify(stages)]);

  return (
    <div className="lp-board container">
      <h3 className="lp-board-title">{title}</h3>
      <div className="lp-board-columns">
        {stageItems.map((s, i) => {
          const items = leadsByStage[s.stageName] || [];
          return (
            <div key={i} className="lp-column">
              <div className="lp-column-header">
                <span>{s.stageName}</span>
                {showCounts && <span className="lp-count">{items.length}</span>}
              </div>
              <div className="lp-column-body">
                {loading ? (
                  <div className="lp-loading">Loading…</div>
                ) : items.length === 0 ? (
                  <div className="lp-card-placeholder">No leads</div>
                ) : (
                  items.slice(0, 6).map((lead: any, idx: number) => (
                    <div key={idx} className="lp-card">
                      <div className="lp-card-title">{lead.name || lead.email || 'Unnamed'}</div>
                      <div className="lp-card-sub">{lead.property?.title || lead.propertyId || ''}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
