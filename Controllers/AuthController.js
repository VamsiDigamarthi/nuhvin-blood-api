import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
import axios from "axios";
const ObjectId = mongodb.ObjectId;
import "dotenv/config";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
//
const apiKey = "NjM1MDM3MzI0YTU4NjY0OTcwMzY3YTYxNzY0MzRkMzQ=";
const sender = "Ram Nayak";
const templateId = "749947";
// const message = "hey";
// const recipientNumber = "9014548747";
const url = "https://api.textlocal.in/send";
//

async function sendOTP(recipientNumber, otp, message) {
  const url = "https://api.textlocal.in/send";

  const params = new URLSearchParams({
    apiKey: apiKey,
    numbers: recipientNumber,
    template: templateId,
    message: message,
    sender: sender,
    otp: otp,
  });

  try {
    const response = await axios.post(url, params);
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
    throw error;
  }
}
export const sendOtp = async (req, res) => {
  // const { recipientNumber } = req.body;
  const message = "Your OTP is: 1234";
  let recipientNumber = "9014548747";
  try {
    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Send OTP via Textlocal API
    const response = await sendOTP(recipientNumber, otp, message);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
  // ---------------------------------------------------
  // async function sendOTP(recipientNumber, message) {
  //   const url = "https://api.textlocal.in/send";

  //   const params = new URLSearchParams({
  //     apikey: apiKey,
  //     numbers: recipientNumber,
  //     message: message,
  //     template: templateId,
  //     sender: sender,
  //   });

  //   try {
  //     const response = await axios.post(url, params);
  //     console.log("Response:", response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error:", error.response.data);
  //     throw error;
  //   }
  // }

  // // Usage
  // const recipientNumber = "+919014548747";
  // const message = "Your OTP is: 1234";
  // sendOTP(recipientNumber, message)
  //   .then(() => console.log("OTP sent successfully"))
  //   .catch((error) => console.error("Failed to send OTP:", error));

  // ===================================
  //
  //
  // const params = new URLSearchParams({
  //   apikey: apiKey,
  //   numbers: recipientNumber, // Use single recipient number here
  //   message: message,
  //   sender: sender,
  // });

  // fetch(url, {
  //   method: "POST",
  //   body: params,
  // })
  //   .then((response) => response.json())
  //   .then((data) => {
  //     console.log("Response:", data);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error);
  //   });
};

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
    isAddPatinet: false,
    signupTime: req.body?.signupTime,
    termAndCondition: req.body?.termAndCondition,
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
    termAndCondition: req.body.termAndCondition,
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
  console.log(req.body);
  const {
    firstName,
    lastName,
    email,
    dateOfBirth,
    address,
    startTime,
    endTime,
    bloodGroup,
    bloodBankName,
    gender,
  } = req.body;
  const updateFields = {};
  if (firstName) updateFields.firstName = firstName;
  if (lastName) updateFields.lastName = lastName;
  if (email) updateFields.email = email;
  if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
  if (address) updateFields.address = address;
  if (startTime) updateFields.startTime = startTime;
  if (endTime) updateFields.endTime = endTime;
  if (bloodGroup) updateFields.bloodGroup = bloodGroup;
  if (bloodBankName) updateFields.bloodBankName = bloodBankName;
  if (gender) updateFields.gender = gender;
  try {
    const user = await userModal.findOne({ mobile: mobile });
    if (user) {
      // console.log(user);
      // console.log(req.body.firstName);
      await userModal.updateOne(
        { mobile: mobile },
        {
          $set: {
            ...updateFields,
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

export const userAvailable = async (req, res) => {
  const userModal = getDb().collection("users");
  let { mobile } = req;
  try {
    const user = await userModal.findOne({ mobile: mobile });
    if (user) {
      let newAvailable = !user.isAvailable;
      if (req.body?.reason) {
        await userModal.updateOne(
          { mobile: mobile },
          { $set: { isAvailable: newAvailable, reason: req.body?.reason } }
        );
        return res.status(201).json({ message: "Updated Successfully...!" });
      } else {
        await userModal.updateOne(
          { mobile: mobile },
          { $set: { isAvailable: newAvailable } }
        );
        return res.status(201).json({ message: "Updated Successfully...!" });
      }
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
  // console.log(req.body?.title);
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

export const uploadBannersTwo = async (req, res) => {
  const userModal = getDb().collection("banersTwo");
  try {
    await userModal.insertOne({
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

export const bannersTwo = async (req, res) => {
  const userModal = getDb().collection("banersTwo");
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
