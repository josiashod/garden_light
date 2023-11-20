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

io.on('connection', (socket) => {
  let addedUser = false;
  
  // when the client emits 'add user', this listens and executes
  socket.on('changeLight', (value) => {
    theme = value
    socket.emit('arduinoLED', theme);
    socket.broadcast.emit('theme changed', theme);
  });

  socket.on('add user', (uuid) => {
    // we store the uuid in the socket session for this client
    socket.username = uuid;
    socket.emit('theme changed', theme)
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

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});