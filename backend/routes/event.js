import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  testEmail,
} from "../controllers/event.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

const router = express.Router();

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  dateTime: z.string().min(1, "Date and time is required"),
});

// Create event
router.post(
  "/",
  authMiddleware,
  validateRequest({ body: eventSchema }),
  createEvent
);

// Get my events
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

// Test email endpoint
router.post("/test-email", authMiddleware, testEmail);

export default router;
