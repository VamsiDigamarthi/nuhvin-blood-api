import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
export const onAddnews = async (req, res) => {
  const news = getDb().collection("news");

  try {
    await news.insertOne({
      title: req.body?.title,
      subTitle: req.body?.subTitle,
      content: req.body.content,
      image: req.file.path,
      date: new Date(),
      place: req.body.place,
    });
    return res.status(201).json({ message: "uploaded successfully..!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "new post failed",
      error,
    });
  }
};

export const fetchAllnews = async (req, res) => {
  const news = getDb().collection("news");
  try {
    const blog = await news.find({}).toArray();
    return res.status(200).json(blog);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "new post failed",
      error,
    });
  }
};

export const onPostAnnouncements = async (req, res) => {
  const news = getDb().collection("announcements");
  try {
    await news.insertOne({
      title: req.body?.title,
    });
    return res.status(201).json({ message: "uploaded successfully..!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "new post failed",
      error,
    });
  }
};

export const onFetchAnnouncements = async (req, res) => {
  const news = getDb().collection("announcements");

  try {
    const blog = await news.findOne({});
    return res.status(200).json(blog);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "new post failed",
      error,
    });
  }
};

// revies

export const onAddReviewa = async (req, res) => {
  const news = getDb().collection("reviews");

  try {
    await news.insertOne({
      name: req.body?.name,
      text: req.body.text,
      // image: req.file.path,
      rating: req.body.rating,
    });
    return res.status(201).json({ message: "uploaded successfully..!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "new post failed",
      error,
    });
  }
};

export const fetchAllReview = async (req, res) => {
  const news = getDb().collection("reviews");
  try {
    const blog = await news.find({}).toArray();
    return res.status(200).json(blog);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "new post failed",
      error,
    });
  }
};
