const { Pool, Client } = require("pg");
require("dotenv").config();

class DatabaseHandler {
  constructor() {
    this.pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: parseInt(process.env.PGPORT)
    });
    this.pool.on("error", (err, client) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });
  }

  async runQuery(query) {
    try {
      const res = await this.pool.query(query);
      return res;
    } catch (err) {
      console.log(err.stack);
    }
  }
}

module.exports = new DatabaseHandler();
