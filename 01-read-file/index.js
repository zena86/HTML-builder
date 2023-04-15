const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'text.txt');

const stream = fs.createReadStream(filePath, 'utf-8');
stream.on('data', (chunk) => {
  console.log(chunk);
});