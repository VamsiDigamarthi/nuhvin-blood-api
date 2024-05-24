import express from "express";
import {
  editProfile,
  getUser,
  registorAsDonor,
  registorBloodBank,
  userAvailable,
  userLogin,
} from "../Controllers/AuthController.js";
import { authenticateToken } from "../middelware/AuthMiddelware.js";
import { upload } from "../middelware/fileUpload.js";

const router = express.Router();

router.post("/donor", registorAsDonor);

// registor ad blood bank

router.post("/blood/bank", registorBloodBank);

// login

router.post("/login", userLogin);

// get profile

router.get("/getUser", authenticateToken, getUser);

router.patch(
  "/edit/profile",
  authenticateToken,
  upload.single("image"),
  editProfile
);

router.patch("/update/user/available", authenticateToken, userAvailable);

export default router;
