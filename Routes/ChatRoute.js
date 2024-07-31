import express from "express";
import {
  createChat,
  findChat,
  userChats,
} from "../Controllers/ChatController.js";
import { authenticateToken } from "../middelware/AuthMiddelware.js";

const router = express.Router();

router.post("/", authenticateToken, createChat);

router.get("/own-all-chats", authenticateToken, userChats);
router.get("/find/:firstId/:secondId", findChat);

export default router;
