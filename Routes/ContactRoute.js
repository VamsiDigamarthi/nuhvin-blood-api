import express from "express";
import { onContactUser } from "../Controllers/ContactController.js";

const router = express.Router();

router.post("/", onContactUser);

export default router;
