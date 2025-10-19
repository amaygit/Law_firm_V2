import express from "express";
import {
  fetchAllahabadDates,
  fetchAllahabadCourts,
  downloadAllahabadCauseList,
  fetchKarnatakaCourts,
  downloadKarnatakaCauseList,
} from "../controllers/causelist.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

// ========== ALLAHABAD ROUTES ==========
router.post("/allahabad/fetch-dates", authMiddleware, fetchAllahabadDates);
router.post("/allahabad/fetch-courts", authMiddleware, fetchAllahabadCourts);
router.post("/allahabad/download", authMiddleware, downloadAllahabadCauseList);

// ========== KARNATAKA ROUTES ==========
router.post("/karnataka/fetch-courts", authMiddleware, fetchKarnatakaCourts);
router.post("/karnataka/download", authMiddleware, downloadKarnatakaCauseList);

export default router;
