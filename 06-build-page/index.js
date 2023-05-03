'use strict';

let fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const distFolderPath = path.join(__dirname, 'project-dist');

let tmpHtml = '';

// Создать папку project-dist
fs.mkdir(distFolderPath, { recursive: true }, err => {
  if (err) throw err;
  console.log('папка создана');
});

// Копировать папку с изображениями
const sourceAssetsPath = path.join(__dirname, 'assets');
const copyAssetsPath = path.join(distFolderPath, 'assets');

fsPromises.mkdir(copyAssetsPath, { recursive: true }).catch((err) => console.log(err));

// fs.readdir(copyAssetsPath, (err, files) => {
//   if (err) throw err;

//   for (const file of files) {
//     fs.unlink(path.join(copyAssetsPath, file), (err) => {
//       if (err) throw err;
//     });
//   }
// });

async function copyFilesTree(source, copy) {
  await fsPromises.readdir(source, { withFileTypes: true }).then(files => {
    files.forEach(async (file) => {
      if (file.isFile()) {
        let sourceFilePath = path.join(source, file.name);
        let copyFilePath = path.join(copy, file.name);
        fs.copyFile(sourceFilePath, copyFilePath, err => { if (err) throw err; });
      } else if (file.isDirectory()) {
        let sourcePath = path.join(source, file.name);
        let copyPath = path.join(copy, file.name);

        fs.mkdir(copyPath, { recursive: true }, err => {
          if (err) throw err;
        });

        await copyFilesTree(sourcePath, copyPath);
      }
    });
  }).catch(err => console.log(err));
}

copyFilesTree(sourceAssetsPath, copyAssetsPath);

// Создать файл стилей
(function mergeStyles() {
  const bundleCssPath = path.join(__dirname, 'project-dist', 'style.css');
  const writableStream = fs.createWriteStream(bundleCssPath);
  const folderPath = path.join(__dirname, 'styles');

  fs.promises.readdir(folderPath, { withFileTypes: true }).then(filenames => {
    for (let filename of filenames) {
      let filePath = path.join(__dirname, 'styles', filename.name);

      if (filename.isFile() && path.extname(filePath) === '.css') {
        const readableStream = fs.createReadStream(filePath);
        readableStream.on('data', (chunk) => {
          writableStream.write(chunk.toString() + '\n');
        });
      }
    }
  }).catch(err => {
    console.log(err);
  });
}());

// Создать файл html
function createHtmlBundle() {
  const sourceHtmlPath = path.join(__dirname, 'template.html');
  const readableHtmlStream = fs.createReadStream(sourceHtmlPath);
  readableHtmlStream.on('data', (chunk) => {
    tmpHtml = chunk.toString();
    analizeComponents();
  });
}
createHtmlBundle();

function analizeComponents() {
  const componentsPath = path.join(__dirname, 'components');
  fs.promises.readdir(componentsPath, { withFileTypes: true }).then(files => {
    for (let file of files) {
      let filePath = path.join(__dirname, 'components', file.name);
      let fileName = path.parse(filePath).name;

      const readableComponentStream = fs.createReadStream(filePath);
      readableComponentStream.on('data', (chunk) => {
        tmpHtml = tmpHtml.replace(`{{${fileName}}}`, chunk.toString());

        const htmlBundlePath = path.join(distFolderPath, 'index.html');
        const writableStream = fs.createWriteStream(htmlBundlePath);
        writableStream.write(tmpHtml);
        writableStream.end();
      });
    }
  }).catch(err => {
    console.log(err);
  });
}
