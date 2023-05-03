'use strict';

const fs = require('fs');
const path = require('path');
const process = require('process');

const bundleCssPath = path.join(__dirname, 'project-dist', 'bundle.css');
const writableStream = fs.createWriteStream(bundleCssPath);
const folderPath = path.join(__dirname, 'styles');

fs.promises
  .readdir(folderPath, { withFileTypes: true })
  .then((filenames) => {
    filenames.forEach(filename => {
      let filePath = path.join(__dirname, 'styles', filename.name);

      if (filename.isFile() && path.extname(filePath) === '.css') {
        const readableStream = fs.createReadStream(filePath);
        readableStream.on('data', (chunk) => {
          writableStream.write(chunk.toString() + '\n');
        });
      }
    });
  })
  .catch((err) => {
    process.stdout.write(err);
  });
