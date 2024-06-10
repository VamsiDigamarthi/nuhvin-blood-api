import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";

const ObjectId = mongodb.ObjectId;
import "dotenv/config";
import jwt from "jsonwebtoken";
import axios from "axios";
import { upload } from "../middelware/fileUpload.js";

//

export const sendOtp = async (req, res) => {
  const { mobile } = req.body;
  try {
    getDb()
      .collection("otp")
      .findOne({ mobile: mobile })
      .then((otpUser) => {
        var otp = Math.floor(100000 + Math.random() * 900000);
        if (otpUser) {
          axios(
            `https://2factor.in/API/V1/${process.env.OTP_API_KEY}/SMS/+91${mobile}/${otp}/OTP TEMPLATE`
          )
            .then(() => {
              getDb()
                .collection("otp")
                .updateOne({ mobile: mobile }, { $set: { otp_value: otp } })
                .then(() => {
                  return res
                    .status(200)
                    .json({ message: "otp send & updated db" });
                })
                .catch((e) => {
                  return res.status(500).json({
                    message: err,
                  });
                });
            })
            .catch((err) => {
              console.log("otp  sending existing user some err");
              return res.status(400).json({ message: "otp send failed" });
            });
        } else {
          var otp = Math.floor(100000 + Math.random() * 900000);
          const doc = { mobile: mobile, otp_value: otp };
          axios(
            `https://2factor.in/API/V1/${process.env.OTP_API_KEY}/SMS/+91${mobile}/${otp}/OTP TEMPLATE`
          )
            .then(() => {
              getDb()
                .collection("otp")
                .insertOne(doc)
                .then(() => {
                  return res
                    .status(200)
                    .json({ message: "otp send updated db" });
                })
                .catch((e) => {
                  return res.status(500).json({
                    message: err,
                  });
                });
            })
            .catch((err) => {
              console.log("otp  sending existing user some err");
              return res.status(400).json({ message: "otp send failed" });
            });
        }
      })
      .catch((e) => {
        console.log("user not exist but failure to load ");
        console.log(e);
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const verifyOtp = async (req, res) => {
  const userModal = getDb().collection("users");
  const otoModal = getDb().collection("otp");
  const { mobile, otp } = req.body;

  try {
    const result = await otoModal.findOne({ mobile: mobile });
    if (result) {
      if (result.otp_value.toString() === otp.toString()) {
        const user = await userModal.findOne({ mobile: mobile });
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
      } else {
        return res.status(401).json({
          msg: "Otp Invalid",
        });
      }
    } else {
      return res.status(401).json({
        msg: "User Not Found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const registorAsDonor = async (req, res) => {
  const userModal = getDb().collection("users");

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
  };

  try {
    await userModal.insertOne(doc);
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

export const donorsCount = async (req, res) => {
  const userModal = getDb().collection("users");
  try {
    const donorsCount = await userModal.countDocuments({
      employeeType: "Donor",
    });
    return res.status(200).json({
      donorsCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const bloodbankCount = async (req, res) => {
  const userModal = getDb().collection("users");
  try {
    const bloodBankCount = await userModal.countDocuments({
      employeeType: "BloodBank",
    });
    return res.status(200).json({
      bloodBankCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const patinetCount = async (req, res) => {
  const patientsModal = getDb().collection("patients");
  try {
    const patinetCount = await patientsModal.countDocuments({});
    return res.status(200).json({
      patinetCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
