/* -----------------------------------------------------------------------
   LeasingFunnel.tsx
   ---------------------------------------------------------------
   Features:
   • Kanban board (Lead → Showing → Applicant → Tenant) – drag‑and‑drop
   • Show‑time scheduler (date + time picker)
   • Mini‑calendar that lists all scheduled showings
   • “Convert to Tenant” button that moves a card to the final column
   • Mock API layer (replace with real endpoints)
   ----------------------------------------------------------------------- */

import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import { format, parseISO } from "date-fns";
import { Calendar, momentLocalizer, Views, Event as RBCEvent } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

/* -------------------------- Types -------------------------------------- */

type Stage = "Lead" | "Showing" | "Applicant" | "Tenant";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: Stage;
  notes?: string;
}

interface Appointment {
  id: string;
  leadId: string;
  title: string; // e.g. “Show – 123 Main St”
  start: string; // ISO string
  end: string;   // ISO string
}

/* -------------------------- Mock API ----------------------------------- */
// In a real project replace these with fetch/axios calls to your backend.
const api = {
  _leads: [] as Lead[],
  _appointments: [] as Appointment[],

  async fetchLeads() {
    await new Promise((r) => setTimeout(r, 200));
    return [...this._leads];
  },

  async fetchAppointments() {
    await new Promise((r) => setTimeout(r, 200));
    return [...this._appointments];
  },

  async saveLead(lead: Lead) {
    const idx = this._leads.findIndex((l) => l.id === lead.id);
    if (idx >= 0) this._leads[idx] = lead;
    else this._leads.push(lead);
    return lead;
  },

  async deleteLead(id: string) {
    this._leads = this._leads.filter((l) => l.id !== id);
  },

  async saveAppointment(app: Appointment) {
    const idx = this._appointments.findIndex((a) => a.id === app.id);
    if (idx >= 0) this._appointments[idx] = app;
    else this._appointments.push(app);
    return app;
  },
};

/* -------------------------- Helpers ------------------------------------ */

function nextStage(current: Stage): Stage {
  const order: Stage[] = ["Lead", "Showing", "Applicant", "Tenant"];
  const idx = order.indexOf(current);
  return order[Math.min(idx + 1, order.length - 1)];
}

function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

/* Draggable lead card */
function DraggableCard({
  lead,
  onEdit,
  onDelete,
  onSchedule,
  onConvert,
}: {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onSchedule: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  } as React.CSSProperties;

  return (
    <Card ref={setNodeRef} style={style} {...listeners} {...attributes} sx={{ mb: 1, cursor: "grab", "&:active": { cursor: "grabbing" } }}>
      <CardContent>
        <Typography variant="subtitle1">{lead.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {lead.email} | {lead.phone}
        </Typography>
        {lead.notes && (
          <Typography variant="body2" mt={1}>
            {lead.notes}
          </Typography>
        )}
        <Box mt={1} display="flex" gap={1}>
          <IconButton size="small" onClick={() => onEdit(lead)}>
            <Edit fontSize="inherit" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(lead.id)}>
            <Delete fontSize="inherit" />
          </IconButton>
          {lead.stage === "Lead" && (
            <Button size="small" variant="outlined" onClick={() => onSchedule(lead)}>
              Schedule Show
            </Button>
          )}
          {lead.stage !== "Tenant" && (
            <Button size="small" variant="contained" onClick={() => onConvert(lead)}>
              Convert to {nextStage(lead.stage)}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

/* Droppable column */
function DroppableColumn({ id, children }: { id: Stage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Box ref={setNodeRef} sx={{ p: 0.5, borderRadius: 2, bgcolor: isOver ? "#f0f7ff" : "#fafafa", minHeight: 80 }}>
      {children}
    </Box>
  );
}

/* -------------------------- Main Component ---------------------------- */

export default function LeasingFunnel() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    (async () => {
      const [l, a] = await Promise.all([api.fetchLeads(), api.fetchAppointments()]);
      setLeads(l);
      setAppointments(a);
    })();
  }, []);

  // CRUD helpers
  const upsertLead = async (lead: Lead) => {
    const saved = await api.saveLead(lead);
    setLeads((prev) => {
      const idx = prev.findIndex((l) => l.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  const deleteLead = async (id: string) => {
    await api.deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const upsertAppointment = async (app: Appointment) => {
    const saved = await api.saveAppointment(app);
    setAppointments((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: any) => {
    setDraggedLeadId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setDraggedLeadId(null);
    if (!over) return;
    const targetStage = over.id as Stage;
    const movingLead = leads.find((l) => l.id === active.id);
    if (!movingLead) return;
    if (movingLead.stage !== targetStage) {
      await upsertLead({ ...movingLead, stage: targetStage });
    }
  };

  // Scheduler dialog state
  const [scheduleDate, setScheduleDate] = useState<string>(""); // YYYY-MM-DD
  const [scheduleTime, setScheduleTime] = useState<string>("09:00"); // HH:mm

  const openScheduler = (lead: Lead) => {
    setActiveLead(lead);
    setScheduleDate(format(new Date(), "yyyy-MM-dd"));
    setScheduleTime("09:00");
    setShowScheduler(true);
  };

  const saveAppointment = async () => {
    if (!activeLead) return;
    const start = new Date(`${scheduleDate}T${scheduleTime}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const newApp: Appointment = {
      id: uuidv4(),
      leadId: activeLead.id,
      title: `Showing – ${activeLead.name}`,
      start: start.toISOString(),
      end: end.toISOString(),
    };
    await upsertAppointment(newApp);
    await upsertLead({ ...activeLead, stage: "Showing" });
    setShowScheduler(false);
    setActiveLead(null);
  };

  // Lead edit/create dialog
  const [tempLead, setTempLead] = useState<Partial<Lead>>({});
  const openLeadDialog = (lead?: Lead) => {
    setTempLead(lead ? { ...lead } : { stage: "Lead" });
    setShowLeadDialog(true);
  };
  const saveLead = async () => {
    const leadToSave: Lead = {
      id: tempLead.id ?? uuidv4(),
      name: tempLead.name ?? "",
      email: tempLead.email ?? "",
      phone: tempLead.phone ?? "",
      notes: tempLead.notes ?? "",
      stage: (tempLead.stage as Stage) ?? "Lead",
    };
    await upsertLead(leadToSave);
    setShowLeadDialog(false);
  };

  const convertLead = async (lead: Lead) => {
    await upsertLead({ ...lead, stage: nextStage(lead.stage) });
  };

  // Calendar
  const localizer = useMemo(() => momentLocalizer(moment), []);
  const calendarEvents: RBCEvent[] = useMemo(
    () =>
      appointments.map((app) => ({
        title: app.title,
        start: parseISO(app.start),
        end: parseISO(app.end),
        resource: app,
      })),
    [appointments]
  );

  const stages: Stage[] = ["Lead", "Showing", "Applicant", "Tenant"];

  return (
    <Box p={2}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Vacancy & Leasing Funnel</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => openLeadDialog()}>
          New Lead
        </Button>
      </Box>

      {/* Kanban */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Box display="flex" gap={2} overflow="auto">
          {stages.map((stage) => (
            <Box key={stage} sx={{ minWidth: 260, border: "1px solid #e0e0e0", borderRadius: 2, p: 1, bgcolor: "#fafafa" }}>
              <Typography variant="h6" align="center" gutterBottom>
                {stage}
              </Typography>
              <DroppableColumn id={stage}>
                {leads
                  .filter((l) => l.stage === stage)
                  .map((lead) => (
                    <DraggableCard key={lead.id} lead={lead} onEdit={openLeadDialog} onDelete={deleteLead} onSchedule={openScheduler} onConvert={convertLead} />
                  ))}
              </DroppableColumn>
            </Box>
          ))}
        </Box>

        <DragOverlay>
          {draggedLeadId ? (
            <Card sx={{ width: 240, opacity: 0.9 }}>
              <CardContent>
                <Typography>{leads.find((l) => l.id === draggedLeadId)?.name}</Typography>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Calendar */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Upcoming Showings
        </Typography>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          defaultView={Views.DAY}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          style={{ height: 500 }}
          selectable={false}
          onSelectEvent={(event: any) => {
            const app = (event as any).resource as Appointment;
            alert(`Showing for ${app.title}\n${format(parseISO(app.start), "PPpp")}`);
          }}
        />
      </Box>

      {/* Lead Dialog */}
      <Dialog open={showLeadDialog} onClose={() => setShowLeadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{tempLead?.id ? "Edit Lead" : "New Lead"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Name" value={tempLead?.name ?? ""} onChange={(e) => setTempLead((p) => ({ ...p, name: e.target.value }))} required />
            <TextField label="Email" type="email" value={tempLead?.email ?? ""} onChange={(e) => setTempLead((p) => ({ ...p, email: e.target.value }))} />
            <TextField label="Phone" value={tempLead?.phone ?? ""} onChange={(e) => setTempLead((p) => ({ ...p, phone: e.target.value }))} />
            <TextField label="Notes" multiline rows={3} value={tempLead?.notes ?? ""} onChange={(e) => setTempLead((p) => ({ ...p, notes: e.target.value }))} />
            <Button variant="contained" onClick={saveLead}>
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Scheduler */}
      <Dialog open={showScheduler} onClose={() => setShowScheduler(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Schedule Showing for {activeLead?.name}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Date" type="date" InputLabelProps={{ shrink: true }} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            <TextField label="Start Time" type="time" InputLabelProps={{ shrink: true }} value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
            <Button variant="contained" onClick={saveAppointment}>
              Save Appointment
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
