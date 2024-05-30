import express from "express";
import { authenticateToken } from "../middelware/AuthMiddelware.js";
import {
  addPatientDetails,
  getEditPatinet,
  getPatinetsDetails,
  isActivePatinet,
  isDeletePatinet,
} from "../Controllers/PatientControllers.js";

const router = express.Router();

router.post("/add/patient", authenticateToken, addPatientDetails);

// get patinets

router.get("/get/patinet", authenticateToken, getPatinetsDetails);

// edit patients

router.patch("/edit/patient", authenticateToken, getEditPatinet);

router.patch("/isdelete/:patinetId", authenticateToken, isDeletePatinet);

router.patch("/isActive/:patinetId", authenticateToken, isActivePatinet)

export default router;
