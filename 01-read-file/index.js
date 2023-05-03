'use strict';

const path = require('path');
const fs = require('fs');
const process = require('process');

const filePath = path.join(__dirname, 'text.txt');

const stream = fs.createReadStream(filePath, 'utf-8');
stream.on('data', (chunk) => {
  process.stdout.write(chunk);
});
