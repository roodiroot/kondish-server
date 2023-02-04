const sharp = require('sharp');
const path = require('path');

module.exports = async (img, fileName, folder) => {
  const formatArray = ['webp', 'png'];

  for (let i = 0; i < formatArray.length; i++) {
    await sharp(img)
      .resize({ width: 400 })
      .toFormat(formatArray[i])
      .toFile(path.resolve('static', folder, `${fileName}.${formatArray[i]}`), (err, info) => {
        if (err) {
          return console.log(err);
        }
        if (info) {
          return;
        }
      })
      .resize({ width: 200 })
      .toFile(path.resolve('static', folder, `${fileName}.min.${formatArray[i]}`), (err, info) => {
        if (err) {
          return console.log(err);
        }
        if (info) {
          return;
        }
      });
  }
};
