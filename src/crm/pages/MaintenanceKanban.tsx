import * as React from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { DndContext, useDraggable, useDroppable, DragEndEvent, closestCenter } from '@dnd-kit/core';
import AssignVendor from '../components/AssignVendor';

type Req = {
  id: string;
  status: 'open' | 'in_progress' | 'completed' | 'closed' | string;
  category?: string;
  priority?: string;
  tenant?: { name?: string; email?: string };
  property?: { address?: string };
};

function KanbanCard({ req }: { req: Req }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: req.id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab',
  } as React.CSSProperties;

  return (
    <Paper ref={setNodeRef} {...listeners} {...attributes} sx={{ p: 1.5, mb: 1, boxShadow: 1 }} style={style}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{req.property?.address || 'Property'}</Typography>
      <Typography variant="body2" color="text.secondary">{req.category || 'general'} • {req.priority || 'normal'}</Typography>
      <Typography variant="caption" color="text.disabled">Tenant: {req.tenant?.name || req.tenant?.email || '—'}</Typography>
      <Box sx={{ mt: 1 }}>
        <AssignVendor requestId={req.id} compact />
      </Box>
    </Paper>
  );
}

function KanbanColumn({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <Box ref={setNodeRef} sx={{ bgcolor: isOver ? 'grey.100' : 'grey.50', borderRadius: 1, p: 1.5, minHeight: 400 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'capitalize', mb: 1 }}>{title.replace('_', ' ')}</Typography>
      {children}
    </Box>
  );
}

export default function MaintenanceKanban() {
  const [requests, setRequests] = React.useState<Req[]>([]);

  const load = React.useCallback(async () => {
    const res = await fetch('/api/maintenance/list', { credentials: 'include' });
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : []);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const updateStatus = React.useCallback(async (id: string, newStatus: string) => {
    if (newStatus === 'closed') {
      await fetch(`/api/admin/maintenance/${id}/close`, { method: 'POST', credentials: 'include' });
    } else {
      await fetch(`/api/maintenance/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
    }
    load();
  }, [load]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const draggableId = String(active.id);
    const destination = String(over.id);
    const item = requests.find(r => r.id === draggableId);
    if (!item) return;
    if (item.status !== destination) updateStatus(draggableId, destination);
  };

  const statuses: Array<Req['status']> = ['open', 'in_progress', 'completed', 'closed'];

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Maintenance Kanban Board</Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label={`Open: ${requests.filter(r => r.status === 'open').length}`}/>
          <Chip size="small" color="warning" label={`In Progress: ${requests.filter(r => r.status === 'in_progress').length}`}/>
          <Chip size="small" color="success" label={`Completed: ${requests.filter(r => r.status === 'completed').length}`}/>
          <Chip size="small" color="default" label={`Closed: ${requests.filter(r => r.status === 'closed').length}`}/>
        </Stack>
      </Stack>

      <DndContext onDragEnd={onDragEnd} collisionDetection={closestCenter}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {statuses.map((s) => (
            <KanbanColumn id={s} title={s} key={s}>
              {requests.filter(r => r.status === s).map((r) => (
                <KanbanCard key={r.id} req={r} />
              ))}
            </KanbanColumn>
          ))}
        </Box>
      </DndContext>
    </Box>
  );
}
