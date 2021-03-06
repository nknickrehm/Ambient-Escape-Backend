require('dotenv').config();

const express = require('express');
const app = express();
global.app = app;

const server = require('http').Server(app);
global.server = server;
const io = require('socket.io')(server);
io.origins('*:*');
global.io = io;

const Pool = require('pg').Pool;
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  database: process.env.PGDATABASE
});
global.pool = pool;

const bodyParser = require('body-parser');
const ip = require('ip');
const colors = require('colors'); // allows for using colors as attribute of strings

const playerRoutes = require('./routes/player'); 
const codeRoutes = require('./routes/code');
const gameRoutes = require('./routes/game');
const riddleRoutes = require('./routes/riddles');
const riddleEventRoutes = require('./routes/riddleEvents');
const storylineRoutes = require('./routes/storyline');

const fileUpload = require('express-fileupload');
const cors = require('cors');

app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors());

app.use('/players/', playerRoutes);
app.use('/codes/', codeRoutes);
app.use('/games/', gameRoutes);
app.use('/riddles/', riddleRoutes);
app.use('/riddleEvents', riddleEventRoutes);
app.use('/storylines/', storylineRoutes);

/* start server */
var port = 8080;
server.listen(port, () => {
  console.log(`Server is running on \x1b[32mhttp://${ip.address()}:${port}\x1b[0m`);
});
