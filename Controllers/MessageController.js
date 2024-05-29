import { getDb } from "../Database/mongoDb.js";

import "dotenv/config";
process.env.TZ = "Asia/Kolkata";

export const addMessage = async (req, res) => {
  const messageModal = getDb().collection("message");
  const { chatId, senderId, text } = req.body;
  const doc = {
    chatId,
    senderId,
    text,
    createdAt: new Date(),
  };

  try {
    const result = await messageModal.insertOne(doc);
    const insertedDoc = await messageModal.findOne({ _id: result.insertedId }); // Retrieve the inserted document
    res.status(200).json(insertedDoc); //
    // res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getMessages = async (req, res) => {
  const messageModal = getDb().collection("message");
  const { chatId } = req.params;
  // console.log(chatId);
  try {
    const result = await messageModal.find({ chatId }).toArray();
    res.status(200).json(result);
    // console.log(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const notifications = async (req, res) => {
  const { senderId, chartId, receiverId } = req.body;
  const messageModal = getDb().collection("notification");
  const doc = {
    senderId,
    chartId,
    receiverId,
    isReady: false,
  };
  try {
    await messageModal.insertOne(doc);
    res.status(200).json("notifications added");
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getAllNotifications = async (req, res) => {
  const messageModal = getDb().collection("notification");
  try {
    const result = await messageModal
      .find({ $and: [{ receiverId: req.params.userId }, { isReady: false }] })
      .toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const notificationsMarkAsRead = async (req, res) => {
  const messageModal = getDb().collection("notification");
  try {
    await messageModal.updateMany(
      {
        $and: [
          {
            chartId: req.params.chartId,
          },
          {
            senderId: req.params.receivedId,
          },
        ],
      },
      { $set: { isReady: true } }
    );
    res.status(200).json("updated successfully..!");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};



