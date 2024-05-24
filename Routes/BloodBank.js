import express from "express";
import { authenticateToken } from "../middelware/AuthMiddelware.js";
import {
  addBloods,
  getBloodBank,
  updateBloodBanks,
} from "../Controllers/BloodBankController.js";

const router = express.Router();

// find blood banks
// router.get(
//   "/find/blood/bank/longitude/:longitude/latitude/:latitude/distance/:distance/bloodGroup/:bloodGroup/quantity/:quantity",
//   authenticateToken
// );

// update blood banks details

// access own blood bank

router.get("/get/blood/bank", authenticateToken, getBloodBank);

router.patch("/update/bloodbank/details", authenticateToken, updateBloodBanks);

// add blood
router.post("/add/bloods", authenticateToken, addBloods);

export default router;
