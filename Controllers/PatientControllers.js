import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
const ObjectId = mongodb.ObjectId;

export const addPatientDetails = async (req, res) => {
  const patientsModal = getDb().collection("patients");
  let { mobile } = req;
  const {
    patientFirstName,
    patientLastName,
    bloodGroup,
    gender,
    quantity,
    requestType,
    requiredDate,
    hospitalName,
  } = req.body;
  try {
    await patientsModal.insertOne({
      patientFirstName,
      patientLastName,
      bloodGroup,
      gender,
      quantity,
      requestType,
      requiredDate,
      hospitalName,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(req.body?.longitude),
          parseFloat(req.body?.latitude),
        ],
      },
      author: mobile,
    });

    return res.status(201).json({ message: "Updated Patient Details..!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getPatinetsDetails = async (req, res) => {
  const patientsModal = getDb().collection("patients");
  let { mobile } = req;
  try {
    const result = await patientsModal
      .find({
        author: mobile,
      })
      .toArray();
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getEditPatinet = async (req, res) => {
  const patientsModal = getDb().collection("patients");
  let { mobile } = req;
  const {
    patientFirstName,
    patientLastName,
    bloodGroup,
    gender,
    quantity,
    requestType,
    requiredDate,
    hospitalName,
  } = req.body;
  const updateFields = {};
  if (patientFirstName) updateFields.patientFirstName = patientFirstName;
  if (patientLastName) updateFields.patientLastName = patientLastName;
  if (bloodGroup) updateFields.bloodGroup = bloodGroup;
  if (gender) updateFields.gender = gender;
  if (quantity) updateFields.quantity = quantity;
  if (requestType) updateFields.requestType = requestType;
  if (requiredDate) updateFields.requiredDate = requiredDate;
  if (hospitalName) updateFields.hospitalName = hospitalName;
  // console.log(updateFields);
  try {
    await patientsModal.updateOne(
      { author: mobile },
      {
        $set: {
          ...updateFields, // Spread the updateFields object to include only provided fields
          author: mobile,
        },
      }
    );
    return res.status(200).json({ message: "updated successfully...!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
