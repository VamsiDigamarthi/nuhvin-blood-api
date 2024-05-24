import express from "express";
import {
  addMessage,
  getAllNotifications,
  getMessages,
  notifications,
  notificationsMarkAsRead,
} from "../Controllers/MessageController.js";

const router = express.Router();

router.post("/", addMessage);

router.get("/:chatId", getMessages);

router.post("/notifications", notifications);

router.get("/all/notifications/:userId", getAllNotifications);

router.put(
  "/notification/martas/read/:chartId/receviredId/:receivedId",
  notificationsMarkAsRead
);

// router.post("/noti", sendPushNotification);

export default router;
