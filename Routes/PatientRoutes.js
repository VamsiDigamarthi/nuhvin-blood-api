import express from "express";
import { authenticateToken } from "../middelware/AuthMiddelware.js";
import {
  addPatientDetails,
  getEditPatinet,
  getPatinetsDetails,
} from "../Controllers/PatientControllers.js";

const router = express.Router();

router.post("/add/patient", authenticateToken, addPatientDetails);

// get patinets

router.get("/get/patinet", authenticateToken, getPatinetsDetails);

// edit patients

router.patch("/edit/patient", authenticateToken, getEditPatinet);

export default router;
