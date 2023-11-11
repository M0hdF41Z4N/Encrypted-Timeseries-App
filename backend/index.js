const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors"); // Add the 'cors' package
const { emitterFunction } = require("./emitter");
const { processMessage ,connectToMongo } = require("./util");

const express = require("express");
require("dotenv").config();

const app = express();

// Initialize the HTTP server
const server = http.createServer(app);

// Add CORS configuration to Socket.IO
// const io = socketIO(server, {
//   cors: {
//     origin: "http://localhost:3000", // Replace with your React app's URL
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// Initialize the port server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Listener server is listening on port ${PORT}`);
});

// Creating http server input/output socket
const io = new Server(server);

// Listner

// Handle incoming socket connections
io.on("connection", (socket) => {
  console.log("Listener connected to emitter");
  // MongoDB connection is established when a socket connects
  connectToMongo()
    .then((collection) => {
      // Handle incoming messages
      socket.on("message", (messageData) => {
        // Split the concatenated messages using "|" as the separator
        const encryptedMessages = messageData.data.split("|");
        
        // Decrypt and process each encrypted message
        encryptedMessages.forEach(async (encryptedMessage) => {
          const { encryptionKey } = messageData;
          const msg =await processMessage(
            encryptedMessage,
            encryptionKey,
            collection
          )
        //   Emmitting data
          io.emit("data", msg);
        });
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error);
    });

  // Handle socket disconnection
  socket.on("disconnect", () => {
    console.log("Listener disconnected from emitter");
  });
});


// First inital immediate emit
// emitterFunction();

setInterval(() => {
  emitterFunction();
}, 10000); // Emit a batch of messages every 10 seconds
