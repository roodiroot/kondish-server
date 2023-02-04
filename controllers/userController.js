const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ApiError = require('../error/ApiError');
const { User } = require('../models/models');

const generatJWT = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: '24h',
  });
};

class UserController {
  async registration(req, res, next) {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        return next(ApiError.badRequest('Введите email и password'));
      }
      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return next(ApiError.badRequest('Эта электронная почта уже используется для регистрации'));
      }
      const heshPassword = await bcrypt.hash(password, 5);
      const user = await User.create({ email, password: heshPassword, role });
      const token = generatJWT(user.id, email, user.role);
      res.json({ token });
    } catch (error) {
      next(ApiError.badRequest('Не предвиденная ошибка'));
    }
  }
  async login(req, res, next) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.internal('Пользователь не найдиен'));
    }
    let comparePasword = bcrypt.compareSync(password, user.password);
    if (!comparePasword) {
      return next(ApiError.internal('Указан не правильный пароль'));
    }
    const token = generatJWT(user.id, user.email, user.role);
    res.json({ token });
  }
  async check(req, res, next) {
    const token = generatJWT(req.user.id, req.user.email, req.user.role);
    res.json({ token });
  }
}

module.exports = new UserController();
