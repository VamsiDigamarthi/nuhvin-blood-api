import express from "express";
import {
  fetchAllnews,
  fetchAllReview,
  onAddnews,
  onAddReviewa,
  onFetchAnnouncements,
  onPostAnnouncements,
} from "../Controllers/BlogController.js";
import { upload } from "../middelware/fileUpload.js";

const router = express.Router();

router.post("/news", upload.single("image"), onAddnews);

router.get("/news", fetchAllnews);

router.post("/announcements", onPostAnnouncements);

router.get("/announcements", onFetchAnnouncements);

router.post("/reviews", onAddReviewa);

router.get("/reviews", fetchAllReview);

export default router;
