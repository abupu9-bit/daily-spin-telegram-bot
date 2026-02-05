const fs = require("fs");
const path = "./db.json";

function loadDB() {
  if (!fs.existsSync(path)) {
    return { users: {} };
  }
  return JSON.parse(fs.readFileSync(path));
}

function saveDB(db) {
  fs.writeFileSync(path, JSON.stringify(db, null, 2));
}

module.exports = { loadDB, saveDB };
