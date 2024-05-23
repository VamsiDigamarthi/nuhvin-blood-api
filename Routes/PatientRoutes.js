import express from "express";
import { authenticateToken } from "../middelware/AuthMiddelware.js";
import { addPatientDetails } from "../Controllers/PatientControllers.js";

const router = express.Router();

router.post("/add/patient", authenticateToken, addPatientDetails);

export default router;
