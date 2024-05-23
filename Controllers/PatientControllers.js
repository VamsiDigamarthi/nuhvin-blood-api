import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
const ObjectId = mongodb.ObjectId;

export const addPatientDetails = async (req, res) => {
  const patientsModal = getDb().db().collection("patients");
  let { mobile } = req;
  const {
    patientFirstName,
    patientLastName,
    bloodGroup,
    gender,
    quantity,
    requestType,
    requiredDate,
  } = req.body;
  try {
    await patientsModal.updateOne({
      patientFirstName,
      patientLastName,
      bloodGroup,
      gender,
      quantity,
      requestType,
      requiredDate,
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
