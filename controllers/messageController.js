const ApiError = require('../error/ApiError');
const bot = require('../telegramAPI');

class MessageController {
  async sendMessage(req, res, next) {
    const { message } = req.body;
    try {
      await bot.sendMessage(process.env.CHAT_ID, message);
    } catch (error) {
      next(ApiError.badRequest('Проблемы с отправкой сообщения'));
    }
    res.status(200).json({ message: 'Сообщение отправлено' });
  }
}

module.exports = new MessageController();
