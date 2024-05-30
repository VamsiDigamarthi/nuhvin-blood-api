import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
const ObjectId = mongodb.ObjectId;

export const updateBloodBanks = async (req, res) => {
  const userModal = getDb().collection("users");
  let { mobile } = req;
  try {
    const user = await userModal.findOne({ mobile: mobile });
    if (user) {
      const data = req.body;
      for (const item of data) {
        const existingBlood = await userModal.findOne({
          $and: [
            { mobile: mobile },
            { "bloodGroups.bloodGroup": item.bloodGroup },
          ],
        });

        if (existingBlood) {
          await userModal.updateOne(
            {
              mobile: mobile,
              "bloodGroups.bloodGroup": item.bloodGroup,
            },
            {
              $set: { "bloodGroups.$.howMuchQuatity": item.howMuchQuatity },
            }
          );
        } else {
          await userModal.updateOne(
            { mobile: mobile },
            { $push: { bloodGroups: item } }
          );
        }
      }

      return res.status(201).json({ message: "Data updated successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getBloodBank = async (req, res) => {
  const userModal = getDb().collection("users");
  let { mobile } = req;
  // console.log(mobile);
  try {
    const result = await userModal.findOne({ mobile: mobile });
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const addBloods = async (req, res) => {
  const userModal = getDb().collection("users");
  let { mobile } = req;
  // console.log(req.body);
  try {
    await userModal.findOneAndUpdate(
      {
        mobile: mobile,
      },
      {
        $set: { bloodGroups: req.body },
      },
      { returnOriginal: false }
    );
    return res.status(201).json({ message: "updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const addBloodBankTimmings = async (req, res) => {
  const userModal = getDb().collection("users");
  let { mobile } = req;
  try {
    await userModal.findOneAndUpdate(
      {
        mobile: mobile,
      },
      {
        $set: { bloodBankTimming: req.body },
      },
      { returnOriginal: false }
    );
    return res.status(201).json({ message: "updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};
