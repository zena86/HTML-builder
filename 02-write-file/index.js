const path = require("path");
const fs = require("fs");
const readline = require("readline");
const process = require("process");

const filePath = path.join(__dirname, "text.txt");
const writableStream = fs.createWriteStream(filePath);

fs.writeFile(filePath, "", (err) => {
  if (err) throw err;
  console.log("Hello! Enter message ... ");
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

process.on("exit", () => {
  writableStream.end();
  console.log("Good bye!");
});

function ask() {
  rl.question("", (answer) => {
    if (answer === "exit") {
      writableStream.end();
      process.exit();
    }
    writableStream.write(answer + "\n");
    ask();
  });
}
ask();
