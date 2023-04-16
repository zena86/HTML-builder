const fs = require('fs');
const fsPromises = fs.promises;
const path = require("path");

const sourceFolderPath = path.join(__dirname, "files");
const copyFolderPath = path.join(__dirname, "files-copy");

fsPromises.mkdir(copyFolderPath, { recursive: true }).catch((err) => console.log(err));

fsPromises.readdir(sourceFolderPath, {withFileTypes: true}).then(filenames => {
  for (let filename of filenames) {
    let sourceFilePath = path.join(sourceFolderPath, filename.name);
    let copyFilePath = path.join(copyFolderPath, filename.name);

    fs.copyFile(sourceFilePath, copyFilePath, err => {if (err) throw err});
  }
}).catch(err => console.log(err))

