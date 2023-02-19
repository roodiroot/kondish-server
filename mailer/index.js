const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

const mail = async (message) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_HOST_USER,
      to: process.env.EMAIL_SEND,
      subject: "ЗАКАЗ С САЙТА",
      text: message,
      html: `<i>${message}</i>`,
    });
    return info.response;
  } catch (error) {
    return "ERROR";
  }
};

module.exports = mail;
