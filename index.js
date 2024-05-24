import express from "express";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";

// import nodemailer from "nodemailer";
import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;
// import Mailgen from "mailgen";
import { getDb, initDb } from "./Database/mongoDb.js";

import AuthRoute from "./Routes/AuthRoutes.js";
import BloodBank from "./Routes/BloodBank.js";
import BloodNeeded from "./Routes/BloodNeeded.js";
import Patient from "./Routes/PatientRoutes.js";
import ContactRoute from "./Routes/ContactRoute.js";
const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const server = http.createServer(app);

initDb((err, db) => {
  if (err) {
    console.log(err);
  } else {
    server.listen(process.env.PORT || 5000, () => {
      console.log(
        `Listening server at ${process.env.PORT} and connect db ........`
      );
    });
  }
});

app.use("/auth", AuthRoute);
app.use("/blood", BloodNeeded);
app.use("/bloodbank", BloodBank);
app.use("/patient", Patient);
// app.use("/contact", ContactRoute);
