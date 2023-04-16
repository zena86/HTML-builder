const fs = require('fs');
const path = require("path");

const folderPath = path.join(__dirname, 'secret-folder');
fs.promises.readdir(folderPath, {withFileTypes: true}).then(filenames => {
  for (let filename of filenames) {
    let filePath = path.join(__dirname, 'secret-folder', filename.name);
    fs.stat(filePath, (err, stats) => {
      if (err) throw err;
      if(stats.isFile()) {
        let fileName = path.parse(filePath).name;
        let fileExt = path.extname(filePath).slice(1);
        let fileSize = stats.size;
        console.log(`${fileName} - ${fileExt} - ${fileSize}`);
      }
    });
  }
}).catch(err => {
  console.log(err)
})
