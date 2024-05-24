import nodemailer from "nodemailer";
export const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "vamsidigamartho03@gmail.com", // Your Gmail email address
      pass: "Chinni0321@", // Your Gmail password
    },
  });

  // Email message options
  const mailOptions = {
    from: email,
    to: "vamsidigamartho03@gmail.com", // Your email address where you want to receive messages
    subject: "New Message from Contact Form",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Send mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent:", info.response);
      res.send("Email sent successfully");
    }
  });
};
