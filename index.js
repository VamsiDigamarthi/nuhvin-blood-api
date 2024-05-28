import express from "express";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
// import nodemailer from "nodemailer";
import mongodb from "mongodb";
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
            let config = {
              service: "gmail",
              host: "smtp.hostinger.com",
              port: 587,
              secure: false,
              auth: {
                user: "bloodbank@nuhvin.com",
                pass: "Nuhvin@nbb24",
              },
              tls: {
                rejectUnauthorized: false, // Do not reject self-signed certificates
              },
            };

            let transporter = nodemailer.createTransport(config);
            let MailGenerator = new Mailgen({
              theme: "default",
              product: {
                name: "NGS",
                link: "https://mailgen.js/",
              },
            });
            let response = {
              body: {
                name: `Daily ${result?.firstName}`,
                intro:
                  "Welcome to NUHVIN BLOOD BANK! Your registration as a donor means the world to us and to those who may benefit from your lifesaving gift. !",
                // table: {
                //   data: [
                //     {
                //       item: "Nodemailer Stack Book",
                //       description: "A Backend application",
                //       price: "$10.99",
                //     },
                //   ],
                // },
                outro:
                  "Thank you for your kindness and willingness to make a difference. ",
              },
            };

            let mail = MailGenerator.generate(response);

            let message = {
              from: "bloodbank@nuhvin.com",
              to: `${result?.email}`,
              subject: "Urgent: Welcome to NUHVIN BLOOD BANK",
              html: mail,
            };

            transporter
              .sendMail(message)
              .then(() => {
                console.log({
                  msg: "you should receive an email",
                });
              })
              .catch((error) => {
                console.log({ error });
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
