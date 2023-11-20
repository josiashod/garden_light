$(function() {
  const socket = io();

  const changeTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);

    window.localStorage.setItem('theme', theme)
  }

  $( document ).ready(function() {
    socket.emit('add user', Date.now());
  });

  _light = document.querySelector("#light")
  _light.addEventListener("click", function (e) {
    currentTheme = document.documentElement.getAttribute("data-theme");

    switchTo = currentTheme === 'light' ? 'dark' : 'light';
    changeTheme(switchTo);
    socket.emit('changeLight', switchTo)
  });

  socket.on('theme changed', (theme) => {
    changeTheme(theme)
  });

  socket.on('disconnect', () => {
    console.log("You have been disconnected");
  });

  socket.on('reconnect', () => {
    console.log("You have been reconnected");
  });

  // socket.on('reconnect_error', () => {
  //   log('attempt to reconnect has failed');
  // });
})