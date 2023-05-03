'use strict';

const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const process = require('process');

const sourceFolderPath = path.join(__dirname, 'files');
const copyFolderPath = path.join(__dirname, 'files-copy');

fsPromises
  .mkdir(copyFolderPath, { recursive: true })
  .catch(err => process.stdout.write(err));

fs.readdir(copyFolderPath, (err, files) => {
  if (err) process.stdout.write(err);

  files.forEach(file => {
    fs.unlink(path.join(copyFolderPath, file), (error) => {
      if (error) process.stdout.write(error);
    });
  });
});

fsPromises
  .readdir(sourceFolderPath, { withFileTypes: true })
  .then((filenames) => {
    filenames.forEach(filename => {
      let sourceFilePath = path.join(sourceFolderPath, filename.name);
      let copyFilePath = path.join(copyFolderPath, filename.name);

      fs.copyFile(sourceFilePath, copyFilePath, (err) => {
        if (err) process.stdout.write(err);
      });
    });
  })
  .catch((err) => process.stdout.write(err));
