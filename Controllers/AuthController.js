import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
import nodemailer from "nodemailer";
// const nodemailer = require("nodemailer");
import Mailgen from "mailgen";
const ObjectId = mongodb.ObjectId;
import "dotenv/config";
import jwt from "jsonwebtoken";

export const registorAsDonor = async (req, res) => {
  const userModal = getDb().collection("users");
  const user = await userModal.findOne({ mobile: req.body?.mobile });
  if (user) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const docs = {
    firstName: req.body?.firstName,
    lastName: req.body?.lastName,
    mobile: req.body?.mobile,
    email: req.body?.email,
    dateOfBirth: req.body?.dateOfBirth,
    bloodGroup: req.body?.bloodGroup,
    gender: req.body?.gender,
    address: req.body?.locations,
    isAvailable: true,
    employeeType: "Donor",
    location: {
      type: "Point",
      coordinates: [
        parseFloat(req.body?.longitude),
        parseFloat(req.body?.latitude),
      ],
    },
  };

  try {
    await userModal.insertOne(docs);
    return res.status(201).json({
      message: "Registration Successfully ..!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const registorBloodBank = async (req, res) => {
  const userModal = getDb().collection("users");
  const user = await userModal.findOne({ mobile: req.body?.mobile });
  if (user) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const doc = {
    bloodBankName: req.body?.bloodBankName,
    mobile: req.body?.mobile,
    email: req.body?.email,
    address: req.body?.address,
    employeeType: "BloodBank",
    isAvailable: true,
    startTime: req.body?.startTime,
    endTime: req.body?.endTime,
    location: {
      type: "Point",
      coordinates: [
        parseFloat(req.body?.longitude),
        parseFloat(req.body?.latitude),
      ],
    },
    bloodGroups: req.body?.bloodGroups,
  };

  try {
    await userModal.insertOne(doc);
    return res.status(200).json({
      message: "Registration Successfully ..!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const userLogin = async (req, res) => {
  const userModal = getDb().collection("users");
  console.log(req.body);
  try {
    const user = await userModal.findOne({ mobile: req.body?.mobile });
    if (user) {
      const payload = {
        mobile: user.mobile,
      };
      const expiresIn = "24h";
      const jwtToken = jwt.sign(payload, process.env.JWT_TOKEN_SECRET);
      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ message: "User Does't exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getUser = async (req, res) => {
  const userModal = getDb().collection("users");
  let { mobile } = req;

  try {
    const user = await userModal.findOne({ mobile: mobile });
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(401).json({ message: "User Does't exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const editProfile = async (req, res) => {
  const userModal = getDb().collection("users");
  let { mobile } = req;
  try {
    const user = await userModal.findOne({ mobile: mobile });
    if (user) {
      // console.log(user);
      if (req.body.firstName || req.body.lastName) {
        // console.log(req.body.firstName);
        await userModal.updateOne(
          { mobile: mobile },
          {
            $set: {
              firstName: req.body?.firstName,
              lastName: req.body?.lastName,
              email: req.body?.email,
              dateOfBirth: req.body?.dateOfBirth,
              address: req.body?.locations,
              startTime: req.body?.startTime,
              endTime: req.body?.endTime,
              // profile: req.file.path,
            },
          }
        );
        return res
          .status(201)
          .json({ message: "Upload profile successfully...!" });
      } else {
        await userModal.updateOne(
          { mobile: mobile },
          {
            $set: {
              bloodBankName: req.body.bloodBankName,
              profile: req.file.path,
            },
          }
        );
        return res
          .status(201)
          .json({ message: "Upload profile successfully...!" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const userAvailable = async (req, res) => {
  const userModal = getDb().collection("users");
  let { mobile } = req;
  try {
    const user = await userModal.findOne({ mobile: mobile });
    if (user) {
      let newAvailable = !user.isAvailable;
      await userModal.updateOne(
        { mobile: mobile },
        { $set: { isAvailable: newAvailable, reason: req.body?.reason } }
      );
      res.status(201).json({ message: "Updated Successfully...!" });
    } else {
      await userModal.insertOne({
        mobile: mobile,
        isAvailable: req.body.isAvailable,
      });
      res.status(201).json({ message: "Updated Successfully...!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getUserById = async (req, res) => {
  const userModal = getDb().collection("users");
  // console.log(req.params.id);
  try {
    const result = await userModal.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (result) {
      console.log(result);
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ msg: "User Does't Exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const editPic = async (req, res) => {
  const userModal = getDb().collection("users");
  let { mobile } = req;
  // console.log(req.body);
  try {
    const user = await userModal.findOne({ mobile: mobile });
    if (user) {
      await userModal.updateOne(
        { mobile: mobile },
        {
          $set: {
            profile: req.file?.path,
          },
        }
      );
      return res
        .status(201)
        .json({ message: "Upload profile successfully...!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// banesr apis
export const uploadPic = async (req, res) => {
  const userModal = getDb().collection("baners");
  try {
    await userModal.insertOne({
      image: req.file.path,
    });
    return res.status(201).json({ message: "uploaded successfully..!" });
    // profile: req.file.path,
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getBanners = async (req, res) => {
  const userModal = getDb().collection("baners");
  try {
    const banners = await userModal.find({}).toArray();
    res.status(200).json(banners);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// feeds

export const uploadFeed = async (req, res) => {
  const feeds = getDb().collection("feeds");
  try {
    await feeds.insertOne({
      title: req.body?.title,
      content: req.body.content,
      image: req.file.path,
    });
    return res.status(201).json({ message: "uploaded successfully..!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getFeeds = async (req, res) => {
  const feeds = getDb().collection("feeds");
  try {
    const banners = await feeds.find({}).toArray();
    res.status(200).json(banners);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
