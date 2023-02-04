const imgLoader = require('../utils/imgLoader.js');
const uuid = require('uuid');

const ApiError = require('../error/ApiError.js');
const { Articles } = require('../models/models.js');

class ArticlesController {
  async create(req, res, next) {
    try {
      const { title, subtitle, date, text } = req.body;
      //РАБОТА ПО ВАЛИДАЦИИ DATA (2012-01-26)
      let newDate = 0;
      if (!date) {
        newDate = new Date(Date.now());
      } else {
        newDate = new Date(Date.parse(date));
      }
      //РАБОТА ПО ВАЛИДАЦИИ TITLE
      if (!title || title.length >= 250) {
        return next(ApiError.badRequest('Введите корректный заголовок'));
      }
      //РАБОТА ПО ВАЛИДАЦИИ SUBTITLE & TEXT
      if (!subtitle || subtitle.length >= 1000 || !text || text.length >= 3000) {
        return next(ApiError.badRequest('Не коректно введен подзаголовок'));
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
          imgLoader(img.data, fileName, 'articles');
        } else {
          return next(ApiError.badRequest('Возможна загрузка форматов типа jpg/jpeg/png'));
        }
      } else {
        return next(ApiError.badRequest('Вы загружаете более одного изображения'));
      }
      // ЗАПИСЬ В БД
      const articles = await Articles.create({
        title,
        subtitle,
        date: newDate,
        text,
        img: fileName,
      });
      res.json(articles);
    } catch (error) {
      next(ApiError.badRequest('Не предвиденная ошибка'));
    }
  }
  async getAll(req, res) {
    let { page, limit } = req.query;
    page = page || 1;
    limit = limit || 8;
    let offset = page * limit - limit;
    const articles = await Articles.findAndCountAll({ limit, offset });
    res.json(articles);
  }
  async getOne(req, res) {
    const { id } = req.params;
    const article = await Articles.findOne({ where: { id } });
    res.json(article);
  }
}

module.exports = new ArticlesController();
