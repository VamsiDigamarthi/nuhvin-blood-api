import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
const ObjectId = mongodb.ObjectId;
import "dotenv/config";

async function checkChatExists(user1Id, user2Id) {
  const chatModal = getDb().collection("chat");
  try {
    // Query the Chat model to find if there's a chat containing both user IDs
    const chat = await chatModal.findOne({
      members: {
        $all: [user1Id, user2Id],
      },
    });

    // If chat exists, return true
    if (chat) {
      // console.log("chat is presents");
      return true;
    } else {
      // console.log("Chat doesn't exist");
      return false; // Chat doesn't exist
    }
  } catch (error) {
    console.error("Error checking chat:", error);
    return false; // Handle error
  }
}

const sendingMailAfterCreateChat = async (res, receiverId, requiredDate) => {
  const userModal = getDb().collection("users");
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
          // user: "software.trainee2@brihaspathi.com",
          // pass: "rqichgzqpgikbuxy",
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
          name: `Dear ${result?.firstName}`,
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
            "Thank you for your kindness and willingness to make a difference. ", //looking
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
      return res.status(200).send("Chat created");
      // return res.status(200).json(result);
    } else {
      console.log({ msg: "User Does't Exist" });
    }
  } catch (error) {
    console.log("send mail failure", error);
  }
};

export const createChat = async (req, res) => {
  const chatModal = getDb().collection("chat");
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;
  const requiredDate = req.body?.requiredDate;
  const chatExists = await checkChatExists(senderId, receiverId);
  if (chatExists) {
    return res.status(200).json("Chat already exists");
  }

  const doc = {
    members: [senderId, receiverId],
  };

  try {
    await chatModal.insertOne(doc);
    // console.log("Chat created");
    sendingMailAfterCreateChat(res, receiverId, requiredDate);
  } catch (error) {
    // console.error("Error creating chat:", error);
    return res.status(500).json(error);
  }
};

// export const createChat = async (req, res) => {
//   const chatModal = getDb().collection("chat");
//   const senderId = req.body.senderId;
//   const receiverId = req.body.receiverId;
//   const requiredDate = req.body?.requiredDate;
//   const chat = await chatModal.findOne({
//     members: {
//       $all: [senderId, receiverId],
//     },
//   });

//   if (chat) {
//     return res.status(200).json(chat);
//   }
//   // const chatExists = await checkChatExists(senderId, receiverId);

//   const doc = {
//     members: [senderId, receiverId],
//   };

//   try {
//     const result = await chatModal.insertOne(doc);
//     return res.status(200).json(result);
//     // console.log("Chat created");
//     // sendingMailAfterCreateChat(res, receiverId, requiredDate);
//   } catch (error) {
//     // console.error("Error creating chat:", error);
//     return res.status(500).json(error);
//   }
// };

export const userChats = async (req, res) => {
  const chatModal = getDb().collection("chat");
  try {
    const chat = await chatModal
      .find({
        members: { $in: [req.params.userId] },
      })
      .toArray();
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const findChat = async (req, res) => {
  const chatModal = getDb().collection("chat");
  try {
    const chat = await chatModal.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};
