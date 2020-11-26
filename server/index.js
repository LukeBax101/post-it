const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require("multer");
const morgan = require('morgan');
const socketIO = require('socket.io');
const cookieParser = require('cookie-parser');
var http = require('http');

const bookshelf = require('./db/bookshelf');
const game = require('./routes/game');
const player = require('./routes/player');
const question = require('./routes/question');

const { cleanDB } = require('./functions/games');


const password = fs.readFileSync(path.join(__dirname,  `../secrets/password`), 'utf8').trim();

const app = express();

app.use(morgan('tiny'));
app.use(cors({credentials: true, origin: 'http://localhost:8081'}));
app.use(bodyParser.json());
app.use(cookieParser(password));

var server = http.createServer(app);
let io = socketIO.listen(server, {
    transports: ['websocket']
});


app.use('/', express.static(path.join(__dirname, '../frontend/dist')));

app.use('/game', (req, res, next) => {
    req.socketio = io;
    next();
}, game);

app.use('/player', (req, res, next) => {
    req.socketio = io;
    next();
}, player);

app.use('/question', (req, res, next) => {
    next();
}, question);

setInterval(cleanDB, 86400000);


setInterval(() => {
  io.emit('test_message', 'can you hear me');
}, 5000);

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`listening on ${port}`);
});
