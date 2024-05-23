import express from "express";
import { authenticateToken } from "../middelware/AuthMiddelware.js";
import { bloodBankList, donorList } from "../Controllers/BloodNeeded.js";

const router = express.Router();

router.get(
  "/find/donor/longitude/:longitude/latitude/:latitude/distance/:distance/:bloodGroup",
  authenticateToken,
  donorList
);

// find blood banks
router.get(
  "/find/blood/bank/longitude/:longitude/latitude/:latitude/distance/:distance/bloodGroup/:bloodGroup/quantity/:quantity",
  authenticateToken,
  bloodBankList
);

export default router;
