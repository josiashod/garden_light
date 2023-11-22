// number of drops created.
var nbDrop = 858; 

// function to generate a random number range.
function randRange( minNum, maxNum) {
  return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
}

// function to generate drops
function createRain() {

	for( i=1;i<nbDrop;i++) {
	var dropLeft = randRange(0,2000);
	var dropTop = randRange(-1000,1400);

	$('.rain').append('<div class="drop" id="drop'+i+'"></div>');
    $('#drop'+i).css('left',dropLeft);
    $('#drop'+i).css('top',dropTop);
	}
}
// // Make it rain
createRain();

$(function() {
  const socket = io();

  const changeTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);

    window.localStorage.setItem('theme', theme)
  }

  const changeWeather = (status) => {
    document.documentElement.setAttribute("data-rain", status);
    window.localStorage.setItem('rain', status)
  }

  $( document ).ready(function() {
    socket.emit('add user', Date.now());
  });

  _light = document.querySelector("#light")
  _light.addEventListener("click", function (e) {
    currentTheme = document.documentElement.getAttribute("data-theme");

    switchTo = currentTheme === 'light' ? 'dark' : 'light';
    changeTheme(switchTo);
    socket.emit('change light', switchTo)
  });

  clouds = document.querySelectorAll(".cloud")
  clouds.forEach(el => {
    el.addEventListener("click", function () {
      currentTheme = document.documentElement.getAttribute("data-rain");
      switchTo = currentTheme === 'off' ? 'on' : 'off';

      changeWeather(switchTo);
      socket.emit('make it rain', switchTo)
    });
  });

  socket.on('theme changed', (theme) => {
    changeTheme(theme)
  });

  socket.on('weather changed', (weather) => {
    changeWeather(weather)
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