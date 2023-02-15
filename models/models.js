const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db.js");

const User = sequelize.define(
  "user",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: "USER" },
  },
  {
    timestamps: false,
  }
);

const Product = sequelize.define(
  "product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vendor_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    brand: { type: DataTypes.STRING, allowNull: false },
    external: { type: DataTypes.BOOLEAN, defaultValue: false },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    pipe_length_max: { type: DataTypes.FLOAT, allowNull: false },
    S: { type: DataTypes.FLOAT, allowNull: false },
    heating_power: { type: DataTypes.FLOAT },
    cooling_power: { type: DataTypes.FLOAT },
    noise: { type: DataTypes.FLOAT },
    WiFi: { type: DataTypes.STRING, defaultValue: "Нет" },
    brand_country: { type: DataTypes.STRING },
    manufacture_country: { type: DataTypes.STRING },
    energy_class: { type: DataTypes.STRING },
    compressor: { type: DataTypes.STRING },
    img_array: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
    img: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING(1234) },
    hit: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    timestamps: false,
  }
);
const Articles = sequelize.define(
  "articles",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    subtitle: { type: DataTypes.STRING(1234) },
    date: { type: DataTypes.DATE },
    text: { type: DataTypes.TEXT },
    img: { type: DataTypes.STRING, allowNull: false },
  },
  {
    timestamps: false,
  }
);
const Reviews = sequelize.define(
  "reviews",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    service: { type: DataTypes.STRING, allowNull: false },
    name_person: { type: DataTypes.STRING, allowNull: false },
    text: { type: DataTypes.STRING(1234), allowNull: false },
    img: { type: DataTypes.STRING },
  },
  {
    timestamps: false,
  }
);
const Gallery = sequelize.define(
  "gallery",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    description: { type: DataTypes.STRING(1234) },
    date: { type: DataTypes.DATE },
    img: { type: DataTypes.STRING },
  },
  {
    timestamps: false,
  }
);

module.exports = {
  User,
  Product,
  Articles,
  Reviews,
  Gallery,
};
