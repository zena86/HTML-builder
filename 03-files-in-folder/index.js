'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const process = require('process');

const folderPath = path.join(__dirname, 'secret-folder');
fsp
  .readdir(folderPath, { withFileTypes: true })
  .then((filenames) => {
    filenames.forEach((filename) => {
      let filePath = path.join(__dirname, 'secret-folder', filename.name);
      fs.stat(filePath, (err, stats) => {
        if (err) process.stdout.write(err);
        if (stats.isFile()) {
          let fileName = path.parse(filePath).name;
          let fileExt = path.extname(filePath).slice(1);
          let fileSize = stats.size;
          let result = `${fileName} - ${fileExt} - ${fileSize}b \n`;
          process.stdout.write(result);
        }
      });
    });
  })
  .catch((err) => {
    process.stdout.write(err);
  });
