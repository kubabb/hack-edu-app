const fs = require('fs');
const path = require('path');

const oldPath = path.join(__dirname, 'app', 'api', 'books');
const newPath = path.join(__dirname, 'app', 'api', '_books');

try {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log("Renamed successfully.");
  } else {
    console.log("Old path does not exist.");
  }
} catch(e) {
  console.error("Error renaming:", e);
}
