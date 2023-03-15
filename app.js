const express = require('express');
const app = express();
const http = require('http');
const session = require("express-session");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
require('dotenv').config();
const port = process.env.PORT || 4000;
const bodyParser = require('body-parser');

// Rendering the front view of the chatbot
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


let menu = ["Bugger", "Pizzer", "Shawarma","fried Rice"];

//session configuration
const sessionMiddleware = session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        //set expiry time for session to 10 days
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
});

//using the session middleware
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

// Socket Connections

io.on("connection", (socket) => {
	console.log("a user connected");
  
	//get the session id from the socket
	const session = socket.request.session;
	const sessionId = session.id;

	//the socket.id changes every time the user refreshes the page, so we use the session id to identify the user and create a room for them
	socket.join(sessionId);

  //welcome the user
  io.to(sessionId).emit("chat_message", {sender: "bot", message: "Welcome to the chat app, say hello to the bot"});

  //a radom variable to store the user's progress
  let progress = 0

  //listen for the chat message event from the client
  socket.on("chat_message", (message) => {

    //output the user message to the DOM by emitting the chat message event to the client
    io.to(sessionId).emit("chat_message", {sender: "user", message});
    // message = from === 'bot' ? 'left' : 'right';
     //logic to check the user's progress
    switch(progress){
      case 0:
        //if the user replies, increase the progress and send the default message
        io.to(sessionId).emit("chat_message", {sender: "bot", message:`Press any of the following keys: <br>
    1. Place Order <br>
    99. Checkout Order <br>
    98. Order History <br>
    0. Cancel Order <br>`});

        progress = 1;
        break;
      case 1:
        //the user has selected an option, so we check which option they selected
        var botresponse = "";
        if(message === "1"){
          for(let i=0; i<menu.length; i++){
            //  console.log(menu[i]);
             botresponse = "You selected option 1 <br> here is the menu:"+ menu;
            // console.log(`${menus}: ${menu[menus]}`);
          }
          // botresponse = "You selected option 1 <br> here is the menu:"+ menu.bugger;
        }else if(message === "99"){
          botresponse = "You selected option 2 <br> checkout your order";

        }else if (message === "98"){
          for(let i=0; i<menu.length; i++){
          botresponse = "You selected option 3 <br> here is your order history:"+ menu[i];
          }
        }else if(message === "0"){
          botresponse = "You selected option 4 <br>order canceled";

        }else{
          //if the user enters an invalid option, we send the default message
          botresponse = "Invalid option <br> Press any of the following keys: <br> 1. Place Order <br> 2. Checkout Order <br> 3. Order History <br> 4. Cancel Order <br>";
          progress = 1;
          io.to(sessionId).emit("chat_message", {sender: "bot", message: botresponse});
          return
        }
        io.to(sessionId).emit("chat_message", {sender: "bot", message: botresponse});

        //reset the progress
        progress = 0;
        break;
    }
    





  });
});

  
  
  server.listen(port, () => {
    console.log(`listening on *:${port}`);
  });   