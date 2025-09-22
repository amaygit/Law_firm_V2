import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from "../controllers/event.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

const router = express.Router();

// ✅ UPDATED: Validation schema for workspace-independent events
const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  dateTime: z.string().min(1, "Date and time is required"),
  phoneNumbers: z
    .array(z.string().min(10, "Valid phone number is required"))
    .min(1, "At least one phone number is required")
    .max(2, "Maximum 2 phone numbers allowed"),
});

// Create event (workspace independent)
router.post(
  "/",
  authMiddleware,
  validateRequest({ body: eventSchema }),
  createEvent
);

// Get my events (all user's events)
router.get("/my-events", authMiddleware, getMyEvents);

// Update event
router.put(
  "/:eventId",
  authMiddleware,
  validateRequest({
    body: eventSchema.partial(),
    params: z.object({ eventId: z.string() }),
  }),
  updateEvent
);

// Delete event
router.delete(
  "/:eventId",
  authMiddleware,
  validateRequest({
    params: z.object({ eventId: z.string() }),
  }),
  deleteEvent
);

export default router;
