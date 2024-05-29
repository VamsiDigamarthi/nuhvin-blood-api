import express from "express";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import fetch from "node-fetch";
import axios from "axios";
// import nodemailer from "nodemailer";
import mongodb from "mongodb";
// const { OTPless } = require('otpless-node-js-auth-sdk');
const ObjectId = mongodb.ObjectId;
// import Mailgen from "mailgen";
import { getDb, initDb } from "./Database/mongoDb.js";
import { Server } from "socket.io";
import AuthRoute from "./Routes/AuthRoutes.js";
import BloodBank from "./Routes/BloodBank.js";
import BloodNeeded from "./Routes/BloodNeeded.js";
import Patient from "./Routes/PatientRoutes.js";
// import ContactRoute from "./Routes/ContactRoute.js";

import ChatRoute from "./Routes/ChatRoute.js";
import MessageRoute from "./Routes/MessageRoute.js";
const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: "*", // Allow requests from this origin
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

// const server = http.createServer(app);
const server = http.createServer(app);
const io = new Server(8080, {
  cors: {
    origin: "*",
  },
});
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
app.use("/chat", ChatRoute);

app.use("/message", MessageRoute);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World.......!" });
});

//
let token = "58d71d95-1cf7-11ef-8b60-0200cd936042";
app.get("/send-otp", async (req, res) => {
  // https://2factor.in/API/V1/:api_key/SMS/:phone_number/AUTOGEN/:otp_template_name

  let mobile = "+919963965937";
  let otp = "6789";

  // const url = `https://2factor.in/API/V1/${token}/SMS/${mobile}/AUTOGEN/:otp_template_name`;
  const url = `https://2factor.in/API/V1/${token}/SMS/${mobile}/${otp}/:otp_template_name`;

  fetch(url, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

app.post("/verify", async (req, res) => {
  let token = "58d71d95-1cf7-11ef-8b60-0200cd936042";
  let mobile = "+919963965937";
  let otp = "6789";
  let url = `https://2factor.in/API/V1/${token}y/SMS/VERIFY3/${mobile}/${req.body.otp}`;

  fetch(url, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

app.post("/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${token}/SMS/${phoneNumber}/AUTOGEN`
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send OTP", details: error.message });
  }
});

app.delete("/chats", async (req, res) => {
  // const chatModal = getDb().db().collection("chat");
  const messageModal = getDb().db().collection("message");
  // const messageModal = getDb().db().collection("notification");
  // const patientsModal = getDb().db().collection("patients");
  const userModal = getDb().db().collection("users");
  try {
    await messageModal.deleteMany({});
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});
// app.use("/contact", ContactRoute);

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }
    // console.log(activeUsers);
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });

  // notifications

  socket.on("send-Notification", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("recieve-notification", data);
    } else {
      console.log("user not online");
    }
  });

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    // console.log("on", user);
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);

      // notifications
    } else {
      const getUser = async () => {
        const userModal = getDb().db().collection("users");
        // console.log(req.params.id);
        try {
          const result = await userModal.findOne({
            _id: new ObjectId(receiverId),
          });
          if (result) {
            // console.log(result);
            const hostingerEmail = "bloodbank@nuhvin.com";
            const hostingerPassword = "Nuhvin@nbb24";

            // Create a transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
              host: "smtp.hostinger.com", // Hostinger's SMTP server
              port: 465, // Secure SMTP port
              secure: true, // true for 465, false for other ports
              auth: {
                user: hostingerEmail,
                pass: hostingerPassword,
              },
            });

            // Setup email data
            let mailOptions = {
              from: "bloodbank@nuhvin.com", // Sender address
              to: `${result?.email}`, // List of receivers
              subject: "Urgent: Welcome to NUHVIN BLOOD BANK", // Subject line
              text: `Dear ${result?.firstName}
               Welcome to NUHVIN BLOOD BANK! Your registration as a donor means the world to us and to 
               those who may benefit from your lifesaving gift. 

               Thank you for your kindness and willingness to make a difference. 
               Best regards, 
               DHARANI 
               NUHVIN BLOOD BANK TEAM
        
        `, // Plain text body
              html: `<div>
          <h2>Dear ${result?.firstName}</h2>
          <p>Welcome to NUHVIN BLOOD BANK! Your registration as a donor means the world to us and to 
          those who may benefit from your lifesaving gift. </p>
          <p>Thank you for your kindness and willingness to make a difference.</p>
          <p>Best regards,</p>
          <h4>
          DHARANI 
          </h4>
          <h4>
          NUHVIN BLOOD BANK TEAM
          </h4>
        </div>`, // HTML body
            };

            // Send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log("Message sent: %s", info.messageId);
              console.log(
                "Preview URL: %s",
                nodemailer.getTestMessageUrl(info)
              );
            });
            // return res.status(200).json(result);
          } else {
            console.log({ msg: "User Does't Exist" });
          }
        } catch (error) {
          console.log(error);
        }
      };
      getUser();
    }
  });
});
