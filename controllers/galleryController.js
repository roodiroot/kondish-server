const imgLoader = require('../utils/imgLoader.js');
const uuid = require('uuid');

const ApiError = require('../error/ApiError.js');
const { Gallery } = require('../models/models.js');

class GalleryController {
  async create(req, res, next) {
    try {
      const { description } = req.body;
      //РАБОТА ПО ВАЛИДАЦИИ DATA (2012-01-26)
      let newDate = new Date(Date.now());

      //РАБОТА ПО ВАЛИДАЦИИ DESCRIPTION
      if (!description || description.length >= 1000) {
        return next(ApiError.badRequest('Не коректно введено описание'));
      }
      //ПРОВЕРКА НА ПРИХОД ФАЙЛОВ
      if (req.files === null) {
        return next(ApiError.badRequest('Загрузите изображение'));
      }
      //РАБОТА ПО ВАЛИДАЦИИ НА ФОРМАТ И КОНВЕРТАЦИЯ КАРТИНКИ
      const { img } = req.files;
      const fileName = uuid.v4();
      if (img.length === undefined) {
        if (
          img.mimetype === 'image/jpeg' ||
          img.mimetype === 'image/png' ||
          img.mimetype === 'image/jpg'
        ) {
          imgLoader(img.data, fileName, 'gallery');
        } else {
          return next(ApiError.badRequest('Возможна загрузка форматов типа jpg/jpeg/png'));
        }
      } else {
        return next(ApiError.badRequest('Вы загружаете более одного изображения'));
      }
      // ЗАПИСЬ В БД
      const gallery = await Gallery.create({
        description,
        date: newDate,
        img: fileName,
      });
      res.json(gallery);
    } catch (error) {
      next(ApiError.badRequest(error));
    }
  }
  async getAll(req, res) {
    let { page, limit } = req.query;
    page = page || 1;
    limit = limit || 8;
    let offset = page * limit - limit;
    const articles = await Gallery.findAndCountAll({ limit, offset });
    res.json(articles);
  }
}

module.exports = new GalleryController();
