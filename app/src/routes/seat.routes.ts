import { Router} from "express";

import { getSeats } from "../controllers/seat.controller";



const router = Router();

router.get("/:id/seats",getSeats);

export default router;