const DatabaseHandler = require("./databaseHandler");

const createGameQuery = {
  text: "INSERT INTO Game (Status) VALUES ($1)",
  values: ["NOT STARTED"]
};

const createPlayerQuery = {
  text:
    "INSERT INTO Player (GameID, Name, Mail, Status) VALUES ($1, $2, $3, $4)",
  values: [1, "Vorname", "test@test.de", "WAITING"]
};

const createRiddleQuery = {
  text:
    "INSERT INTO Riddle (GameID, Progress, Name, Status) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)",
  values: [1, 0, "A", "WAITING", 1, 0, "B", "WAITING"]
};

seed();

async function seed() {
  const g = await DatabaseHandler.runQuery(createGameQuery);
  const p = await DatabaseHandler.runQuery(createPlayerQuery);
  const r = await DatabaseHandler.runQuery(createRiddleQuery);
}
