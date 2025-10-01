import express from "express";
import { createEvent, updateEvent, setRSVP, cancelEvent, listEvents } from "../services/calendar";
import ics from "ics";

const router = express.Router();

router.get("/", async (req, res) => {
  const { orgId, since, until } = req.query as any;
  const events = await listEvents(String(orgId || "demo-org"), since ? new Date(since) : undefined, until ? new Date(until) : undefined);
  res.json(events);
});

router.post("/", async (req, res) => {
  const body = req.body || {};
  const ev = await createEvent({
    organizationId: body.organizationId || "demo-org",
    title: body.title,
    description: body.description,
    type: body.type,
    propertyId: body.propertyId,
    workOrderId: body.workOrderId,
    startsAt: new Date(body.startsAt),
    endsAt: new Date(body.endsAt),
    allDay: !!body.allDay,
    createdById: body.createdById || "admin1",
    location: body.location,
    attendeeIds: body.attendeeIds || [],
  });
  res.json(ev);
});

router.post("/:id", async (req, res) => {
  const ev = await updateEvent(req.params.id, req.body || {});
  res.json(ev);
});

router.post("/:id/rsvp", async (req, res) => {
  const { userId, rsvp } = req.body || {};
  const updated = await setRSVP(req.params.id, userId, rsvp);
  res.json(updated);
});

router.post("/:id/cancel", async (req, res) => {
  const ev = await cancelEvent(req.params.id);
  res.json(ev);
});

router.get("/ical/:userId", async (req, res) => {
  const userId = req.params.userId;
  const events = await listEvents("demo-org");
  const icsEvents = events.map((e) => ({
    title: e.title,
    description: e.description || "",
    location: e.location || "",
    start: [
      e.startsAt.getFullYear(),
      e.startsAt.getMonth() + 1,
      e.startsAt.getDate(),
      e.startsAt.getHours(),
      e.startsAt.getMinutes(),
    ],
    end: [
      e.endsAt.getFullYear(),
      e.endsAt.getMonth() + 1,
      e.endsAt.getDate(),
      e.endsAt.getHours(),
      e.endsAt.getMinutes(),
    ],
  }));
  ics.createEvents(icsEvents, (err, file) => {
    if (err) return res.status(500).send("ICS error");
    res.setHeader("Content-Type", "text/calendar");
    res.setHeader("Content-Disposition", `attachment; filename="${userId}-events.ics"`);
    res.send(file);
  });
});

export default router;
