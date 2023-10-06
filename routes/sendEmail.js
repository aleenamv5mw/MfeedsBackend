const nodemailer = require("nodemailer");

const sendEmail = async (to, messageContent) => {
  try {
    const transporter = nodemailer.createTransport({});
    //message obj
    const message = {
      to,
      subject: "Subscription expiry message",
    };
    //send the email
    const info = await transporter.sendMail(message);
    console.log("Message sent");
  } catch (error) {
    console.log(error);
    throw new Error("Email could not be sent");
  }
};
module.exports = sendEmail;
