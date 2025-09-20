import express from "express";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from "../controllers/event.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

const router = express.Router();

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dateTime: z.string().min(1, "Date and time is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
});

// Create event
router.post(
  "/",
  authMiddleware,
  validateRequest({ body: eventSchema }),
  createEvent
);

// Get workspace events
router.get("/workspace/:workspaceId", authMiddleware, getEvents);

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

export default router;
// import express from "express";
// import { createEvent, getEvents } from "../controllers/event.js";

// const router = express.Router();

// router.post("/", createEvent); // POST /api/events
// router.get("/", getEvents); // GET /api/events

// export default router;
