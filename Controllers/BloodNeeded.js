import mongodb from "mongodb";
import { getDb } from "../Database/mongoDb.js";
const ObjectId = mongodb.ObjectId;
import nodemailer from "nodemailer";
import "dotenv/config";

// send mail to each donor

const sendEmails = async (users) => {
  const userModal = getDb().collection("users");

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // Hostinger's SMTP server
    port: 465, // Secure SMTP port
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  for (const user of users) {
    let timeOfUser = new Date(user?.mailSendTime);
    let nowDate = new Date();
    let timeDifference = nowDate - timeOfUser;
    let finalTimeDifference = timeDifference / (1000 * 60 * 60);
    console.log(finalTimeDifference)
    if (finalTimeDifference >= 6 || isNaN(finalTimeDifference)) {
      // console.log("if block exicuted");
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Urgent: Welcome to NUHVIN BLOOD BANK",
        text: `Dear ${user?.firstName}
                Welcome to NUHVIN BLOOD BANK! Your registration as a donor means the world to us and to
                those who may benefit from your lifesaving gift.

                Thank you for your kindness and willingness to make a difference.
                Best regards,
                DHARANI
                NUHVIN BLOOD BANK TEAM
             `,
        html: `<div>
                  <h2>Dear ${user?.firstName}</h2>
                  <p>Welcome to NUHVIN BLOOD BANK! Your registration as a donor means the world to us and to
                  those who may benefit from your lifesaving gift. </p>
                  <p>Thank you for your kindness and willingness to make a difference.</p>
                  <p>Best regards,</p>
                  <h4>
                  DHARANI
                  </h4>
                  <h4>
                  NUHVIN BLOOD BANK TEAM
                  </h4>
             </div>`,
      };

      try {
        await transporter.sendMail(mailOptions);
        await userModal.updateOne(
          { mobile: user?.mobile },
          { $set: { mailSendTime: nowDate } }
        );
        console.log(`Email sent to ${user.email}`);
      } catch (error) {
        console.error(
          `Failed to send email to ${user.email}: ${error.message}`
        );
      }
    }
  }
};

// donors list api
export const donorList = async (req, res) => {
  const userModal = getDb().collection("users");
  let meters = parseInt(req.params.distance) * 1000;
  // console.log(req.params.longitude);
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

    res.status(200).json(donors);

    // const users = [
    //   { firstName: "User One", email: "vamsidigamarthi03@gmail.com" },
    //   { firstName: "User Two", email: "vamsikrishna212121@gmail.com" },
    //   // Add more users as needed
    // ];
    // Send emails in the background
    sendEmails(donors).catch(console.error);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const bloodBankList = async (req, res) => {
  const userModal = getDb().collection("users");
  let meters = parseInt(req.params.distance) * 1000;
  console.log(req.params?.bloodGroup, req.params?.quantity);
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
export const getRecevierList = async (req, res) => {
  const patientsModal = getDb().collection("patients");
  let meters = parseInt(req.params.distance) * 1000;
  try {
    const receviers = await patientsModal
      .find({
        $and: [
          // {
          //   employeeType: "Donor", // Filter based on blood group
          // },
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

    return res.status(200).json(receviers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
