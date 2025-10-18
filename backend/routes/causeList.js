// backend/routes/causelist.js
import express from "express";
import {
  fetchAvailableDates,
  fetchAvailableCourts,
  downloadCauseList,
} from "../controllers/causelist.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

// Fetch available dates
router.post("/fetch-dates", authMiddleware, fetchAvailableDates);

// Fetch available courts for a date
router.post("/fetch-courts", authMiddleware, fetchAvailableCourts);

// Download cause list PDF
router.post("/download", authMiddleware, downloadCauseList);

export default router;
