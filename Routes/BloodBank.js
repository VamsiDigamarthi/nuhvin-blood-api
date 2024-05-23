import express from "express";
import { authenticateToken } from "../middelware/AuthMiddelware.js";
import { updateBloodBanks } from "../Controllers/BloodBankController.js";

const router = express.Router();

// find blood banks
// router.get(
//   "/find/blood/bank/longitude/:longitude/latitude/:latitude/distance/:distance/bloodGroup/:bloodGroup/quantity/:quantity",
//   authenticateToken
// );

// update blood banks details

router.patch("/update/bloodbank/details", authenticateToken, updateBloodBanks);

export default router;
