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
import jwt from "jsonwebtoken";
import "dotenv/config";
// const { OTPless } = require('otpless-node-js-auth-sdk');
const ObjectId = mongodb.ObjectId;
// import Mailgen from "mailgen";
import { getDb, initDb } from "./Database/mongoDb.js";
import { Server } from "socket.io";
import AuthRoute from "./Routes/AuthRoutes.js";
import BloodBank from "./Routes/BloodBank.js";
import BloodNeeded from "./Routes/BloodNeeded.js";
import Patient from "./Routes/PatientRoutes.js";
import ConcatRoute from "./Routes/ContactRoute.js";
// import ContactRoute from "./Routes/ContactRoute.js";

import ChatRoute from "./Routes/ChatRoute.js";
import MessageRoute from "./Routes/MessageRoute.js";

import NewBlog from "./Routes/BlogRoutes.js";
import { authenticateToken } from "./middelware/AuthMiddelware.js";

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
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

initDb((err, db) => {
  if (err) {
    console.log(err);
  } else {
    server.listen(process.env.PORT, () => {
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

app.use("/blog", NewBlog);

app.use("/contact", ConcatRoute);

// dummy data  apis start

// register
app.post("/register", async (req, res) => {
  const userModal = getDb().collection("newUsers");
  const {
    mobile,
    password,
    fullName,
    bloodGroup,
    yearOfBirth,
    email,
    // country,
    state,
    district,
    city,
    // emergencyAvailability,
    // above18Years,
  } = req.body;
  try {
    const docs = {
      mobile: parseFloat(mobile),
      password,
      fullName,
      bloodGroup,
      yearOfBirth,
      email,
      country: "india",
      state,
      district,
      city,
      // emergencyAvailability,
      // above18Years,
    };
    await userModal.insertOne(docs);
    return res.status(201).json({
      message: "Registration Successfully ..!",
    });
  } catch (error) {
    console.log({ error: error.message, message: "new registration failed" });
    res.status(500).json({ message: "new registration failed" });
  }
});

app.patch("/edit-profile/:mobile", async (req, res) => {
  const userModal = getDb().collection("newUsers");
  const {
    fullName,
    bloodGroup,
    yearOfBirth,
    email,
    // country,
    state,
    district,
    city,
    // emergencyAvailability,
    // above18Years,
  } = req.body;
  const { mobile } = req.params;
  const updateFields = {};
  if (mobile) updateFields.mobile = parseFloat(mobile);
  // if (password) updateFields.password = password;
  if (fullName) updateFields.fullName = fullName;
  if (bloodGroup) updateFields.bloodGroup = bloodGroup;
  if (yearOfBirth) updateFields.yearOfBirth = yearOfBirth;
  if (email) updateFields.email = email;
  // if (country) updateFields.country = country;
  if (state) updateFields.state = state;
  if (district) updateFields.district = district;
  if (city) updateFields.city = city;
  // if (emergencyAvailability) updateFields.emergencyAvailability = emergencyAvailability;
  // if (above18Years) updateFields.above18Years = above18Years;
  try {
    await userModal.updateOne(
      { mobile: parseFloat(mobile) },
      { $set: updateFields },
      {new : true },
    );
    return res.status(200).json({ message: "Profile Edited Successfully.." });
  } catch (error) {
    console.log({ error: error.message, message: "Profile edit failed" });
    return res.status(500).json({ message: "Profile edit failed" });
  }
});

app.post("/last-donation/:mobile", async (req, res) => {
  const userModal = getDb().collection("lastDonation");
  const { mobile } = req.params;
  const { donationDate, patientName, location, hospitalName, typeOfDonation } =
    req.body;
  try {
    const docs = {
      mobile: parseFloat(mobile),
      donationDate,
      patientName,
      location,
      hospitalName,
      typeOfDonation,
    };
    await userModal.insertOne(docs);
    return res
      .status(201)
      .json({ message: "Last Donation Logged Successfully.." });
  } catch (error) {
    console.log({
      error: error.message,
      message: "Failed to get last donation",
    });
    return res.status(500).json({ message: "Failed to get last donation" });
  }
});

app.get("/donation-list/:mobile", async (req, res) => {
  const userModal = getDb().collection("lastDonation");
  const { mobile } = req.params;
  try {
    const docs = await userModal.find({ mobile: parseFloat(mobile) }).toArray();

    return res.status(200).json(docs);
  } catch (error) {
    console.log({
      error: error.message,
      message: "Failed to get donation list",
    });
    res.status(500).json({ message: "Failed to get donation list" });
  }
});

app.delete("/account-deleted/:mobile", async (req, res) => {
  const userModal = getDb().collection("newUsers");
  const { mobile } = req.params;
  try {
    await userModal.deleteOne({ mobile: parseFloat(mobile) });
    return res.status(200).json({ message: "Account Deleted Successfully.." });
  } catch (error) {
    console.log({ error: error.message, message: "account deleted failed" });
    res.status(500).json({ message: "account deleted failed" });
  }
});

app.get("/profile/:mobile", async (req, res) => {
  const userModal = getDb().collection("newUsers");
  const { mobile } = req.params;
  try {
    const user = await userModal.findOne({ mobile: parseFloat(mobile) });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    delete user.password;
    return res.status(200).json(user);
  } catch (error) {
    console.log({ error: error.message, message: "Failed to get profile" });
    res.status(500).json({ message: "Failed to get profile" });
  }
});

app.post("/login", async (req, res) => {
  const userModal = getDb().collection("newUsers");
  const { mobile, password } = req.body;
  try {
    const user = await userModal.findOne({ mobile: parseFloat(mobile) });
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect Password" });
    }
    const payload = {
      mobile: user.mobile,
    };
    const expiresIn = "24h";
    const jwtToken = jwt.sign(payload, process.env.JWT_TOKEN_SECRET);
    return res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.log({ error: error.message, message: "Login failed" });
    res.status(500).json({ message: "Login failed" });
  }
});

app.get(
  "/donor/:bloodGroup/:state/:district/:city",
  // authenticateToken,
  async (req, res) => {
    const userModal = getDb().collection("newUsers");
    try {
      const { bloodGroup, state, district, city } = req.params;
      const docs = await userModal
        .find({
          bloodGroup,
          // country,
          state,
          district,
          city,
        })
        .toArray();
      return res.status(200).json({ donors: docs });
    } catch (error) {
      console.log({
        error: error.message,
        message: "fetching donor failed..!",
      });
    }
  }
);

app.patch("/donor-report/:id", async (req, res) => {
  const userModal = getDb().collection("newUsers");
  const { report } = req.body;
  try {
    await userModal.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { report: report } }
    );
    return res.status(200).json({ message: "Report Updated Successfully..!" });
  } catch (error) {
    console.log({ error: error.message, message: "update report failed" });
    res.status(500).json({ message: "update report failed" });
  }
});

app.patch("/forgot-password", async (req, res) => {
  const userModal = getDb().collection("newUsers");
  const { mobile, password } = req.body;

  // Convert mobile to double
  const mobileDouble = parseFloat(mobile);

  try {
    // Query using the converted double value
    const user = await userModal.findOne({ mobile: mobileDouble });

    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    // Update the password
    await userModal.updateOne(
      { _id: new ObjectId(user._id) }, // Ensure user._id is an ObjectId
      { $set: { password } }
    );
    return res.status(200).json({ message: "Password Reset Successfully..!" });
  } catch (error) {
    console.log({ error: error.message, message: "forgot password failed" });
    res.status(500).json({ message: "forgot password failed" });
  }
});

app.post("/api/items", async (req, res) => {
  const userModal = getDb().collection("newUsers");
  try {
    await userModal.insertMany(req.body);
  } catch (error) {
    console.log({ error: error.message, message: "exel error" });
    res.status(500).json({ message: "exel error" });
  }
});

// dummy data apis end

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
    console.log(activeUsers);
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
    console.log("on", user);
    console.log(data);
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);

      // notifications
    } else {
      const getUser = async () => {
        const userModal = getDb().collection("users");
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
