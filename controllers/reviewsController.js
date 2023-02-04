const uuid = require('uuid');
const ApiError = require('../error/ApiError');
const { Reviews } = require('../models/models');
const imgLoader = require('../utils/imgLoader');

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
          ApiError.badRequest('Заполниет все поля, и установите правильное кличество символов'),
        );
      //ПРОВЕРКА НА ПРИХОД ФАЙЛОВ
      // if (req.files === null) {
      //   return next(ApiError.badRequest('Загрузите изображение'));
      // }
      //РАБОТА ПО ВАЛИДАЦИИ НА ФОРМАТ И КОНВЕРТАЦИЯ КАРТИНКИ
      // const { img } = req.files;
      // const fileName = uuid.v4();
      // if (img.length === undefined) {
      //   if (
      //     img.mimetype === 'image/jpeg' ||
      //     img.mimetype === 'image/png' ||
      //     img.mimetype === 'image/jpg'
      //   ) {
      //     imgLoader(img.data, fileName, 'reviews');
      //   } else {
      //     return next(ApiError.badRequest('Возможна загрузка форматов типа jpg/jpeg/png'));
      //   }
      // } else {
      //   return next(ApiError.badRequest('Вы загружаете более одного изображения'));
      // }
      const reviews = await Reviews.create({
        service,
        name_person,
        text,
        // img: fileName,
      });

      res.json(reviews);
    } catch (error) {
      next(ApiError.badRequest('Не обработанная ошибка'));
    }
  }
  async getAll(req, res) {
    let { page, limit } = req.query;
    page = page || 1;
    limit = limit || 5;
    let offset = page * limit - limit;
    const reviews = await Reviews.findAndCountAll({ limit, offset });
    res.json(reviews);
  }
  async getOne(req, res) {
    const { id } = req.params;
    const review = await Reviews.findOne({ where: { id } });
    res.json(review);
  }
}

module.exports = new ReviewsController();
