const ApiError = require("../error/ApiError");
const { Reviews } = require("../models/models");

class ReviewsController {
  async create(req, res, next) {
    try {
      const { service, name_person, text } = req.body;
      //ПРОВЕРКА НАЛИЧИЯ ЗАПОЛНЕНИЯ SERVICE, NAME_PERSON, TEXT
      if (
        !service ||
        service.length >= 100 ||
        !name_person ||
        name_person.length >= 100 ||
        !text ||
        text.length >= 1000
      )
        return next(
          ApiError.badRequest(
            "Заполниет все поля, и установите правильное кличество символов"
          )
        );

      const reviews = await Reviews.create({
        service,
        name_person,
        text,
        // img: fileName,
      });

      res.json(reviews);
    } catch (error) {
      next(ApiError.badRequest("Не обработанная ошибка"));
    }
  }
  async getAll(req, res) {
    let { page, limit } = req.query;
    page = page || 1;
    limit = limit || 100;
    let offset = page * limit - limit;
    const reviews = await Reviews.findAndCountAll({ limit, offset });
    res.json(reviews);
  }
  async getOne(req, res) {
    const { id } = req.params;
    const review = await Reviews.findOne({ where: { id } });
    res.json(review);
  }
  // УДАЛЕНИЕ ОТЗЫВА
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      const status = await Reviews.destroy({
        where: { id },
      });
      res.json({ status });
    } catch (error) {
      next(ApiError.badRequest("Не обработанная ошибка"));
    }
  }
}

module.exports = new ReviewsController();
