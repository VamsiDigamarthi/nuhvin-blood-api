import express from "express";
import { authenticateToken } from "../middelware/AuthMiddelware.js";
import {
  bloodBankList,
  donorList,
  getRecevierList,
} from "../Controllers/BloodNeeded.js";

const router = express.Router();

router.get(
  "/find/donor/longitude/:longitude/latitude/:latitude/distance/:distance/:bloodGroup",
  authenticateToken,
  donorList
);

router.get(
  "/find/recevire/list/longitude/:longitude/latitude/:latitude/distance/:distance/bloodGroup/:bloodGroup",
  getRecevierList
);

// find blood banks
router.get(
  "/find/blood/bank/longitude/:longitude/latitude/:latitude/distance/:distance/bloodGroup/:bloodGroup/quantity/:quantity",
  authenticateToken,
  bloodBankList
);

export default router;
