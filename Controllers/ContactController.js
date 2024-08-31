import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";

export const onContactUser = async (req, res) => {
  const news = getDb().collection("news");
  try {
    await news.insertOne({
      name: req.body?.name,
      email: req.body?.email,
      message: req.body?.message,
      date: new Date(),
    });
    return res.status(201).json({ message: "Tank you...!" });
  } catch (error) {
    console.log("Contact failed..!", error);
    return res.status(500).json({ error: error, message: "Contact failed" });
  }
};
