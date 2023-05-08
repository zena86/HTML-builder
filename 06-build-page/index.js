'use strict';

let fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const process = require('process');

const distFolderPath = path.join(__dirname, 'project-dist');
const distAssetsFolderPath = path.join(distFolderPath, 'assets');

async function hasAccessFunc(filePath) {
  return new Promise(resolve => {
    fs.access(filePath, fs.constants.F_OK, (error) => {
      if (error) { resolve(false); }

      fs.stat(filePath, (err) => {
        if (err) { resolve(false); } else {
          resolve(true);
        }
      });
    });
  });
}

async function copyFileAsync(from, to) {
  return new Promise(resolve => {
    fs.copyFile(from, to, (err) => {
      if (err) {
        process.stdout.write(err);
      }
      resolve(err === null);
    });
  });
}

async function createFolder(folder) {
  return new Promise(resolve => {
    fs.mkdir(folder, { recursive: true }, (err) => {
      if (err) {
        process.stdout.write(err);
      }
      resolve(err == null);
    });
  });
}

async function build() {
  let tmpHtml = '';

  // Создать папку project-dist
  if (!(await hasAccessFunc(distAssetsFolderPath))) {
    await fs.mkdir(distAssetsFolderPath, { recursive: true }, (err) => {
      if (err) process.stdout.write(err);
    });
  }

  // Копировать папку с изображениями
  const sourceAssetsPath = path.join(__dirname, 'assets');
  const copyAssetsPath = path.join(distFolderPath, 'assets');

  async function clearAssets(fromPath) {
    const hasAccess = await hasAccessFunc(fromPath);
    if (!hasAccess) { return; }

    const paths = await fsPromises.readdir(fromPath, { withFileTypes: true });
    paths.forEach(async innerPath => {
      const fullPath = path.join(fromPath, innerPath.name);
      if (innerPath.isFile()) {
        await fs.unlink(fullPath, (error) => {
          if (error) process.stdout.write(error);
        });
      } else {
        await clearAssets(fullPath);
      }
    });
  }

  await clearAssets(copyAssetsPath);

  async function copyFilesTree(source, copy) {
    const pathes = await fsPromises.readdir(source, { withFileTypes: true });
    pathes.forEach(async (file) => {
      let sourcePath = path.join(source, file.name);
      let copyPath = path.join(copy, file.name);

      if (file.isFile()) {
        await copyFileAsync(sourcePath, copyPath);
      } else if (file.isDirectory()) {
        const isFolderExist = await hasAccessFunc(copyPath);
        if (!isFolderExist) {
          await createFolder(copyPath);
        }
        await copyFilesTree(sourcePath, copyPath);
      }
    });
  }

  await copyFilesTree(sourceAssetsPath, copyAssetsPath);

  // Создать файл стилей
  (function mergeStyles() {
    const bundleCssPath = path.join(__dirname, 'project-dist', 'style.css');
    const writableStream = fs.createWriteStream(bundleCssPath);
    const folderPath = path.join(__dirname, 'styles');

    fs.promises
      .readdir(folderPath, { withFileTypes: true })
      .then((filenames) => {
        filenames.forEach((filename) => {
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
  }());

  // Создать файл html
  async function analizeComponents() {
    const componentsPath = path.join(__dirname, 'components');
    fs.promises
      .readdir(componentsPath, { withFileTypes: true })
      .then((files) => {
        files.forEach((file) => {
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
        });
      })
      .catch((err) => {
        process.stdout.write(err);
      });
  }

  async function createHtmlBundle() {
    const sourceHtmlPath = path.join(__dirname, 'template.html');
    const readableHtmlStream = fs.createReadStream(sourceHtmlPath);
    readableHtmlStream.on('data', async (chunk) => {
      tmpHtml = chunk.toString();
      await analizeComponents();
    });
  }
  createHtmlBundle();
}

build();
