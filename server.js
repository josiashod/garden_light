// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;


// Routing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//broadcasting
let numUsers = 0;
var theme = "dark";
var rain = "off";

io.on('connection', (socket) => {
  let addedUser = false;
  
  // when the client emits 'change light', this listens and executes
  socket.on('change light', (value) => {
    theme = value
    socket.emit('led', theme);
    socket.broadcast.emit('theme changed', theme);
  });

  // when the client emits 'make it rain', this listens and executes
  socket.on('make it rain', (value) => {
    rain = value
    socket.emit('water', rain);
    socket.broadcast.emit('weather changed', rain);
  });

  socket.on('add user', (uuid) => {
    // we store the uuid in the socket session for this client
    socket.username = uuid;
    socket.emit('theme changed', theme)
    socket.emit('weather changed', rain)
    ++numUsers;
    addedUser = true;
  });

  // // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    // echo globally that this client has left
    // socket.broadcast.emit('user left', {
    //   username: socket.username,
    //   numUsers: numUsers
    // });
  });
});

app.get('/output_state', (req, res) => {
  const states = {
     "23": (theme == 'dark') ? "0" : "1",
     "27": (theme == 'dark') ? "0" : "1",
     "2": (rain == 'off') ? "0" : "1",
  };
  res.send(states);
});

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});