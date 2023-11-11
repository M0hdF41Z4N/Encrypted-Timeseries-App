const crypto = require("crypto");
const io = require("socket.io-client");
const {generateRandomMessage , encryptMessage} = require('./util');

const serverUrl = "http://localhost:8080"; // Replace with your listener server URL
const socket = io(serverUrl);


socket.on("connect", () => {
  console.log("Emitter connected to the server.");
});

socket.on("disconnect", () => {
  console.log("Emitter disconnected from the server.");
});

const emitterFunction = () => {
  // Generate a random number of messages between 49 and 499
  const numberOfMessages = Math.floor(Math.random() * (499 - 49 + 1) + 49);
  const encryptedMessages = []; // Array to store individual encrypted messages
  // creating random encrypted key   
  let encryptionKey = crypto.randomBytes(32);

  for (let i = 0; i < numberOfMessages; i++) {
    // Generating message
    const message = generateRandomMessage();
    // Encrypting message
    const encryptedMessage = encryptMessage(message, encryptionKey);
    encryptedMessages.push(encryptedMessage); // Store the encrypted message
  }

  // Concatenate the encrypted messages with "|" as the separator
  const concatenatedMessages = encryptedMessages.join("|");

    // Emitting the encrypted messages   
  socket.emit("message", {
    data: concatenatedMessages,
    encryptionKey: encryptionKey.toString("hex"), // Use encryptionKey here
  });
};


module.exports = { emitterFunction };
