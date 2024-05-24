import express from "express";
// import { authenticateToken } from "../middelware/AuthMiddelware.js";
import { sendContactEmail } from "../Controllers/ContactController.js";

const router = express.Router();

router.post("/add/contact", sendContactEmail);

export default router;
