import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
const ObjectId = mongodb.ObjectId;

export const addPatientDetails = async (req, res) => {
  const patientsModal = getDb().collection("patients");
  const userModal = getDb().collection("users");
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
    emergency,
    AttendePhone,
    addTime,
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
      emergency: emergency ? emergency : false,
      isDelete: false,
      active: true,
      AttendePhone,
      addTime: addTime ? addTime : "not time",
      location: {
        type: "Point",
        coordinates: [
          parseFloat(req.body?.longitude),
          parseFloat(req.body?.latitude),
        ],
      },
      author: mobile,
    });

    await userModal.updateOne(
      { mobile: mobile },
      {
        $set: {
          isAddPatinet: true,
        },
      }
    );

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
    AttendePhone,
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
  if (AttendePhone) updateFields.AttendePhone = AttendePhone;
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

export const isDeletePatinet = async (req, res) => {
  const patientsModal = getDb().collection("patients");
  let { mobile } = req;
  let { patinetId } = req.params;
  try {
    const patinet = await patientsModal.findOne({
      $and: [{ author: mobile }, { _id: new ObjectId(patinetId) }],
    });

    if (patinet) {
      let isDelete = !patinet.isDelete;
      await patientsModal.updateOne(
        { $and: [{ author: mobile }, { _id: new ObjectId(patinetId) }] },
        { $set: { isDelete: isDelete } }
      );
      return res.status(201).json({ message: "updated successfully ....!" });
    } else {
      return res
        .status(400)
        .json({ message: "patient not found plaese check once...!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const isActivePatinet = async (req, res) => {
  const patientsModal = getDb().collection("patients");
  let { mobile } = req;
  let { patinetId } = req.params;
  try {
    const patinet = await patientsModal.findOne({
      $and: [{ author: mobile }, { _id: new ObjectId(patinetId) }],
    });
    if (patinet) {
      let active = !patinet.active;
      await patientsModal.updateOne(
        { $and: [{ author: mobile }, { _id: new ObjectId(patinetId) }] },
        { $set: { active: active } }
      );
      return res.status(201).json({ message: "updated successfully ....!" });
    } else {
      return res
        .status(400)
        .json({ message: "patient not found plaese check once...!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
