import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  lockSeats,
  releaseSeats,
  getReservationSummary,
} from "../controllers/seat.controller";

const router = Router();

router.post("/lock-seats", authenticate, lockSeats);
router.delete("/release-seats", authenticate, releaseSeats);
router.get("/summary", authenticate, getReservationSummary);

export default router;