import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
import nodemailer from "nodemailer";
// const nodemailer = require("nodemailer");
import Mailgen from "mailgen";
const ObjectId = mongodb.ObjectId;
import "dotenv/config";
import jwt from "jsonwebtoken";

export const registorAsDonor = async (req, res) => {
  const userModal = getDb().db().collection("users");
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
  const userModal = getDb().db().collection("users");
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
    location: {
      type: "Point",
      coordinates: [
        parseFloat(req.body?.longitude),
        parseFloat(req.body?.latitude),
      ],
    },
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
  const userModal = getDb().db().collection("users");
  try {
    const user = await userModal.findOne({ mobile: req.body?.mobile });
    if (user) {
      const payload = {
        mobile: user.mobile,
      };
      const expiresIn = "24h";
      const jwtToken = jwt.sign(payload, process.env.JWT_TOKEN_SECRET, {
        expiresIn,
      });
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
  const userModal = getDb().db().collection("users");
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
  const userModal = getDb().db().collection("users");
  let { mobile } = req;
  try {
    const user = await userModal.findOne({ mobile: mobile });
    if (user) {
      if (req.body.firstName || req.body.lastName) {
        await userModal.updateOne(
          { mobile: mobile },
          {
            $set: {
              firstName: req.body?.firstName,
              lastName: req.body?.lastName,
              profile: req.file.path,
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
