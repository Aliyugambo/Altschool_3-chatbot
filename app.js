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
const MemoryStore = require('memorystore')(session);

// Rendering the front view of the chatbot
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// let menu = ["Bugger", "Pizzer", "Shawarma","fried Rice"];

//session configuration
const sessionMiddleware = session({
  store: new MemoryStore({
  }),
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
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next)
});


// Rendering the front view of the chatbot
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Socket Connections
let sessionRooms = {};
io.on("connection", (socket) => {
	console.log("a user connected");
	//get the session id from the socket
	const session = socket.request.session.id;
	const sessionId =session;
  console.log("a user connected",socket.id);
  console.log("session id" +sessionId);

	//the socket.id changes every time the user refreshes the page, so we use the session id to identify the user and create a room for them
  if (sessionRooms.hasOwnProperty(sessionId)) {

    // If session ID doesn't exist, create a new room and add it to sessionRooms object
    const newRoom = `session_${sessionId}`;
    socket.join(newRoom);
    console.log("existing session found " + newRoom)
  } else {

    // If session ID already exists, add socketID to existing room
    console.log("new session found", sessionId)
    sessionRooms[sessionId] = {
      deviceId: socket.id,
      currentOrder: [],
      orderHistory: []
    };
    socket.join(sessionId)
  }
  //welcome the user
  // Listen for incoming bot messages
  socket.on("bot-message", async (message) => {
    console.log("Bot message received:", message);
    socket.emit("bot-message", message);
  });

  // Listen for incoming user messages
  socket.on("user-message", async (message) => {
    console.log("User message received:", message);
    socket.emit("user-message", message);
  });

  // Listen for disconnection event
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
  server.listen(port, () => {
    console.log(`listening on *:${port}`);
  });   