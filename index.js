const express= require('express');
const WebSocket = require('ws');
 //EXPRESS SERVER CODE
var app=express();
app.set('port',(process.env.PORT || 8080));
app.use(express.static('public'));
var server=app.listen(app.get('port'),function(){
    console.log('server listening')
});


//WEBSOCKET SERVER CODE
const wss = new WebSocket.Server({ server:server});


//wss.clients.length
wss.on('connection', function (wsclient) {
  
  wsclient.on('message', function (message) {
      //message received from client to server
      var data = JSON.parse(message);
      console.log('received:', data);
      if (data.action && data.action == "send-PlayerWon"){
        var broadcastData={
          action:"playerWon",
          player:data.player
        }
        wss.clients.forEach(function (oneClient) {
          oneClient.send(JSON.stringify(broadcastData));
        });
      };
      if(data.action && data.action =="send-cardPlayed"){
        var broadcastData = {
          action: "cardPlayed",
          value:data.value,
          suit:data.suit
        };
        wss.clients.forEach(function (oneClient) {
          if (oneClient !== wsclient && oneClient.readyState === WebSocket.OPEN) {
            oneClient.send(JSON.stringify(broadcastData));
          }
        });
      }

      if (data.action && data.action == "send-player") {
        var broadcastData = {
          action: "new-PlayerJoined",
          name: data.name
        };
        wss.clients.forEach(function (oneClient) {
          oneClient.send(JSON.stringify(broadcastData));
        });
      }
 
    if (data.action && data.action == "send-message") {
      // BROADCAST to all clients, from server to each client
      var broadcastData = {
        action: "new-message",
        name: data.name,
        message: data.message
      };

      //broadcastToAll(broadcastData);  
      wss.clients.forEach(function (oneClient) {
        oneClient.send(JSON.stringify(broadcastData));
      });
    // console.log('received: %s', message); 
    // wsclient.send('something else');
    }
  });

  //wsclient.send("Hi, I'm the server");
});