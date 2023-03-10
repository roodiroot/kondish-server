const { Op } = require("sequelize");
const uuid = require("uuid");
const path = require("path");

const imgLoader = require("../utils/imgLoader.js");
const ApiError = require("../error/ApiError");
const { Product } = require("../models/models");

class ProductController {
  // СОЗДАНИЕ ПРОДУКТА
  async create(req, res, next) {
    try {
      // получаем параметрамеми из запроса
      let {
        vendor_code,
        external,
        brand,
        name,
        price,
        pipe_length_max,
        S,
        heating_power,
        cooling_power,
        noise,
        WiFi,
        brand_country,
        manufacture_country,
        energy_class,
        compressor,
        description,
        hit,
      } = req.body;

      // валидация обязательных значений на наличие
      if (!vendor_code)
        return next(ApiError.badRequest("не указан vendor_code!"));
      if (!brand) return next(ApiError.badRequest("не указан brand!"));
      const nameProduct = await Product.findOne({ where: { name } });
      if (nameProduct)
        return next(
          ApiError.badRequest("Товар с таким названием уже существует!")
        );
      const vendorProduct = await Product.findOne({ where: { vendor_code } });
      if (vendorProduct)
        return next(ApiError.badRequest("Товар с таким кодом уже существует!"));
      // валидация текстовых значений на кол-во символов
      if (
        (WiFi && WiFi.length >= 15) ||
        (brand_country && brand_country.length >= 15) ||
        (manufacture_country && manufacture_country.length >= 15) ||
        (energy_class && energy_class.length >= 15) ||
        (compressor && compressor.length >= 15) ||
        (description && description.length >= 1234)
      ) {
        return next(ApiError.badRequest("Слишком длинный текст в полях"));
      }

      // валидация цифровых значений и переформат их в Number
      let priceNumber = Number(price);
      if (priceNumber === 0) {
        priceNumber = 100;
      }
      const pipe_length_maxNumber = Number(pipe_length_max);
      const SNumber = Number(S);
      const heating_powerNumber = Number(heating_power);
      const cooling_powerNumber = Number(cooling_power);
      const noiseNumber = Number(noise);
      if (isNaN(priceNumber))
        return next(
          ApiError.badRequest("price должен быть указан в формате числа")
        );
      if (isNaN(pipe_length_maxNumber))
        return next(
          ApiError.badRequest(
            "pipe_length_max должен быть указан в формате числа"
          )
        );
      if (isNaN(SNumber))
        return next(
          ApiError.badRequest("S должен быть указан в формате числа")
        );
      if (isNaN(heating_powerNumber))
        return next(
          ApiError.badRequest(
            "heating_power должен быть указан в формате числа"
          )
        );
      if (isNaN(cooling_powerNumber))
        return next(
          ApiError.badRequest(
            "cooling_power должен быть указан в формате числа"
          )
        );
      if (isNaN(noiseNumber))
        return next(
          ApiError.badRequest("noise должен быть указан в формате числа")
        );

      //ПРОВЕРКА НА ПРИХОД ФАЙЛОВ
      if (req.files === null) {
        return next(ApiError.badRequest("Изображения обязательны к загрузке"));
      }
      // валидация изображений по количеству и формату принимаем только .jpg .jpeg .png
      const { img_array, img } = req.files;
      const imgArray = [];

      //валидация на наличие загруженых фото
      if (img_array === undefined)
        return next(
          ApiError.badRequest(
            "загрузите как минимум одно изображение в массив изображений"
          )
        );
      if (img === undefined)
        return next(ApiError.badRequest("загрузите одно изображение"));

      //валидация на формат и количество главного изображения
      const fileNameMine = uuid.v4();
      if (img.length === undefined) {
        if (img.mimetype === "image/png") {
          imgLoader(img.data, fileNameMine, "png");
          // img.mv(path.resolve(__dirname, '..', 'static', 'png', fileNameMine));
        } else {
          return next(
            ApiError.badRequest("Возможна загрузка форматов типа png")
          );
        }
      } else {
        return next(
          ApiError.badRequest("в поле с изображением загрузите 1 изображение")
        );
      }
      // валидация на количество и формат массива изображений
      if (img_array.length >= 4) {
        return next(ApiError.badRequest("загрузите менее 4 изображений"));
      } else if (img_array.length === undefined) {
        if (
          img_array.mimetype === "image/jpeg" ||
          img_array.mimetype === "image/png" ||
          img_array.mimetype === "image/jpg"
        ) {
          const fileName = uuid.v4();
          imgLoader(img_array.data, fileName, "products");
        } else {
          return next(
            ApiError.badRequest("Возможна загрузка форматов типа jpg/jpeg/png")
          );
        }
      } else {
        for (let i = 0; i < img_array.length; i++) {
          if (
            img_array[i].mimetype === "image/jpeg" ||
            img_array[i].mimetype === "image/png" ||
            img_array[i].mimetype === "image/jpg"
          ) {
            const fileName = uuid.v4();
            imgLoader(img_array[i].data, fileName, "products");
            imgArray.push(fileName);
          } else {
            return next(
              ApiError.badRequest(
                "Возможна загрузка форматов типа jpg/jpeg/png"
              )
            );
          }
        }
      }

      if (external !== "true") {
        external = false;
      }
      if (hit !== "true") {
        hit = false;
      }
      // res.send(external);
      // return;

      // ЗАПИСЬ В БД
      const product = await Product.create({
        vendor_code,
        brand,
        name,
        external,
        price: priceNumber,
        pipe_length_max: pipe_length_maxNumber,
        S: SNumber,
        heating_power: heating_powerNumber,
        cooling_power: cooling_powerNumber,
        noise: noiseNumber,
        WiFi,
        brand_country,
        manufacture_country,
        energy_class,
        compressor,
        description,
        img: fileNameMine,
        img_array: imgArray,
        hit,
      });

      res.json(product);
    } catch (error) {
      next(ApiError.badRequest("Не предвиденная ошибка"));
    }
  }
  // ПОЛУЧЕНИЕ ВСЕХ ПРОДУКТОВ
  async getAll(req, res) {
    try {
      let {
        page,
        limit,
        minPrice,
        maxPrice,
        brand,
        S,
        WiFi,
        hit,
        external,
        compressor,
      } = req.query;
      page = page || 1;
      limit = limit || 5;
      let offset = page * limit - limit;

      minPrice = minPrice || 1;
      maxPrice = maxPrice || 1000000;

      let hit2;
      if (hit) {
        hit2 = hit.toLowerCase().trim() === "true";
      }

      if (external) {
        if (external.toLowerCase().trim() === "true") {
          external = "true";
        }
        if (external.toLowerCase().trim() === "false") {
          external = "false";
        }
        if (
          external.toLowerCase().trim() !== "false" &&
          external.toLowerCase().trim() !== "true"
        ) {
          external = undefined;
        }
      }

      console.log(external);

      let products;
      if (brand && S && WiFi && !hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            WiFi,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && WiFi && !hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            WiFi,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && WiFi && !hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            WiFi,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && WiFi && !hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            WiFi,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && S && !WiFi && !hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && !WiFi && !hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && !WiFi && !hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && !WiFi && !hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && S && WiFi && hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            WiFi,
            hit: hit2,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && WiFi && hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            WiFi,
            hit: hit2,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && WiFi && hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            WiFi,
            hit: hit2,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && WiFi && hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            WiFi,
            hit: hit2,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && S && !WiFi && hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            hit: hit2,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && !WiFi && hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            hit: hit2,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && !WiFi && hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            hit: hit2,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && !WiFi && hit2 && external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            hit: hit2,
            external,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && S && WiFi && !hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            WiFi,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && WiFi && !hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            WiFi,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && WiFi && !hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            WiFi,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && WiFi && !hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            WiFi,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && S && !WiFi && !hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && !WiFi && !hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && !WiFi && !hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && !WiFi && !hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && S && WiFi && hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            WiFi,
            hit: hit2,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && WiFi && hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            WiFi,
            hit: hit2,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && WiFi && hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            WiFi,
            hit: hit2,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && WiFi && hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            WiFi,
            hit: hit2,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && S && !WiFi && hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            hit: hit2,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && !WiFi && hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            hit: hit2,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && !WiFi && hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            hit: hit2,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && !WiFi && hit2 && !external && compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            hit: hit2,
            compressor,
          },
          limit,
          offset,
        });
      }
      if (brand && S && WiFi && !hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            WiFi,
            external,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && WiFi && !hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            WiFi,
            external,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && WiFi && !hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            WiFi,
            external,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && WiFi && !hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            WiFi,
            external,
          },
          limit,
          offset,
        });
      }
      if (brand && S && !WiFi && !hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            external,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && !WiFi && !hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            external,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && !WiFi && !hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            external,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && !WiFi && !hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            external,
          },
          limit,
          offset,
        });
      }
      if (brand && S && WiFi && hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            WiFi,
            hit: hit2,
            external,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && WiFi && hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            WiFi,
            hit: hit2,
            external,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && WiFi && hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            WiFi,
            hit: hit2,
            external,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && WiFi && hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            WiFi,
            hit: hit2,
            external,
          },
          limit,
          offset,
        });
      }
      if (brand && S && !WiFi && hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            hit: hit2,
            external,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && !WiFi && hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            hit: hit2,
            external,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && !WiFi && hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            hit: hit2,
            external,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && !WiFi && hit2 && external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            hit: hit2,
            external,
          },
          limit,
          offset,
        });
      }
      if (brand && S && WiFi && !hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            WiFi,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && WiFi && !hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            WiFi,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && WiFi && !hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            WiFi,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && WiFi && !hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            WiFi,
          },
          limit,
          offset,
        });
      }
      if (brand && S && !WiFi && !hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && !WiFi && !hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && !WiFi && !hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && !WiFi && !hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
          },
          limit,
          offset,
        });
      }
      if (brand && S && WiFi && hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            WiFi,
            hit: hit2,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && WiFi && hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            WiFi,
            hit: hit2,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && WiFi && hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            WiFi,
            hit: hit2,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && WiFi && hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            WiFi,
            hit: hit2,
          },
          limit,
          offset,
        });
      }
      if (brand && S && !WiFi && hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            S,
            hit: hit2,
          },
          limit,
          offset,
        });
      }
      if (brand && !S && !WiFi && hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            brand,
            hit: hit2,
          },
          limit,
          offset,
        });
      }
      if (!brand && S && !WiFi && hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            S,
            hit: hit2,
          },
          limit,
          offset,
        });
      }
      if (!brand && !S && !WiFi && hit2 && !external && !compressor) {
        products = await Product.findAndCountAll({
          where: {
            price: { [Op.between]: [minPrice, maxPrice] },
            hit: hit2,
          },
          limit,
          offset,
        });
      }
      const cookie = "samesite=none";
      res.setHeader("set-cookie", [cookie]);
      res.json(products);
    } catch (error) {
      res.json({ message: "Не обработанная ошибка2" });
    }
  }
  // ПОЛУЧЕНИЕ ОДНОГО ПРОДУКТА
  async getOne(req, res) {
    const { id } = req.params;
    const product = await Product.findOne({ where: { vendor_code: id } });
    res.json(product);
  }
  // ИЗМЕНЕНИЕ ПАРАМЕТРОВ ПРОДУКТА
  async update(req, res, next) {
    try {
      const {
        id,
        name,
        price,
        pipe_length_max,
        S,
        heating_power,
        cooling_power,
        noise,
        WiFi,
        energy_class,
        compressor,
        description,
        hit,
      } = req.body;

      if ((id && isNaN(Number(id))) || id == "")
        return next(ApiError.badRequest("Значение id должно быть числом"));
      if ((price && isNaN(Number(price))) || price == "")
        return next(ApiError.badRequest("Значение price должно быть числом"));
      if (
        (pipe_length_max && isNaN(Number(pipe_length_max))) ||
        pipe_length_max == ""
      )
        return next(
          ApiError.badRequest("Значение pipe_length_max должно быть числом")
        );
      if ((S && isNaN(Number(S))) || S == "")
        return next(ApiError.badRequest("Значение S должно быть числом"));
      if (
        (heating_power && isNaN(Number(heating_power))) ||
        heating_power == ""
      )
        return next(
          ApiError.badRequest("Значение heating_power должно быть числом")
        );
      if (
        (cooling_power && isNaN(Number(cooling_power))) ||
        cooling_power == ""
      )
        return next(
          ApiError.badRequest("Значение cooling__power должно быть числом")
        );
      if ((noise && isNaN(Number(noise))) || noise == "")
        return next(ApiError.badRequest("Значение noise должно быть числом"));

      let boolHit;
      !hit || typeof hit == "string" ? (boolHit = false) : (boolHit = true);

      const product = await Product.update(
        {
          name,
          price,
          pipe_length_max,
          S,
          heating_power,
          cooling_power,
          noise,
          WiFi,
          energy_class,
          compressor,
          description,
          hit: boolHit,
        },
        { where: { id } }
      );
      res.json(product);
    } catch (error) {
      next(ApiError.badRequest("Не обработанная ошибка"));
    }
  }
  // УДАЛЕНИЕ ПРИБОРА
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      const status = await Product.destroy({
        where: { id },
      });
      res.json({ status });
    } catch (error) {
      next(ApiError.badRequest("Не обработанная ошибка"));
    }
  }
}

module.exports = new ProductController();
