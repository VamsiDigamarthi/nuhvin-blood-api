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
    return res.status(200).send("Chat created");
  } catch (error) {
    // console.error("Error creating chat:", error);
    return res.status(500).json(error);
  }
};


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
