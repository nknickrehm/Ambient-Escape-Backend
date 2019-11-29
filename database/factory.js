require("dotenv").config();
const { createDb, migrate } = require("postgres-migrations");

console.log("create database: ", process.env.PGDATABASE);
createDb(process.env.PGDATABASE, {
  defaultDatabase: "postgres", // optional, default: "postgres"
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT)
})
  .then(() => {
    console.log("database created: ", process.env.PGDATABASE);
    return migrate(
      {
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT)
      },
      "./database/migrations"
    );
  })
  .then(() => {
    console.log("migrations successful");
  })
  .catch(err => {
    console.log(err);
  });
