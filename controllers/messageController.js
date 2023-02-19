const ApiError = require("../error/ApiError");
const mail = require("../mailer");
const bot = require("../telegramAPI");

class MessageController {
  async sendMessage(req, res, next) {
    const { message } = req.body;
    try {
      let status_telegram = 0;
      let status_mail = 0;
      await bot
        .sendMessage(process.env.CHAT_ID, message)
        .then(() => (status_telegram = 200))
        .catch(() => (status_telegram = 404));
      await mail(message)
        .then(() => (status_mail = 200))
        .catch(() => (status_mail = 404));
      res.status(200).json({ telefram: status_telegram, mail: status_mail });
    } catch (error) {
      next(ApiError.badRequest("Проблемы с отправкой сообщения"));
    }
  }
}

module.exports = new MessageController();
