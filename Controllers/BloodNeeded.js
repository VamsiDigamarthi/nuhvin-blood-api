import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
const ObjectId = mongodb.ObjectId;

// donors list api
export const donorList = async (req, res) => {
  const userModal = getDb().db().collection("users");
  let meters = parseInt(req.params.distance) * 1000;
  try {
    const donors = await userModal
      .find({
        $and: [
          {
            employeeType: "Donor", // Filter based on blood group
          },
          {
            bloodGroup: req.params?.bloodGroup,
          },
          {
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [
                    parseFloat(req.params?.longitude),
                    parseFloat(req.params?.latitude),
                  ],
                },
                $maxDistance: meters,
                $minDistance: 0,
              },
            },
          },
        ],
      })
      .toArray();

    return res.status(200).json(donors);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const bloodBankList = async (req, res) => {
  const userModal = getDb().db().collection("users");
  let meters = parseInt(req.params.distance) * 1000;
  try {
    const donors = await userModal
      .find({
        $and: [
          {
            employeeType: "BloodBank", // Filter based on blood group
          },
          {
            "bloodGroups.bloodGroup": req.params?.bloodGroup,
            "bloodGroups.howMuchQuatity": { $gte: req.params?.quantity },
          },
          {
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [
                    parseFloat(req.params?.longitude),
                    parseFloat(req.params?.latitude),
                  ],
                },
                $maxDistance: meters,
                $minDistance: 0,
              },
            },
          },
        ],
      })
      .toArray();

    return res.status(200).json(donors);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// recevires list api
