const MongoClient = require("mongodb").MongoClient;
const crypto = require("crypto");
const data = require("./data.json");
const names = data.names;
const cities = data.cities;
require("dotenv").config();

// MongoDB connection URL
const mongoUrl = process.env.mongoURL;

// Function to generate Random message
function generateRandomMessage() {
    // Getting random name , origin and destination
    const name = names[Math.floor(Math.random() * names.length)];
    const origin = cities[Math.floor(Math.random() * cities.length)];
    const destination = cities[Math.floor(Math.random() * cities.length)];

    // Creating message
    const originalMessage = {
      name,
      origin,
      destination,
    };
  
    // Create a secret_key by creating a sha-256 hash of the originalMessage
    const secret_key = crypto
      .createHash("sha256")
      .update(JSON.stringify(originalMessage))
      .digest("hex");
  
    return {
      ...originalMessage,
      secret_key,
    };
  }

// Function to encrypt the message
function encryptMessage(message, encryptionKey) {
const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    encryptionKey,
    Buffer.from("00000000000000000000000000000000", "hex")
);

let encryptedMessage = cipher.update(JSON.stringify(message), "utf-8", "hex");
encryptedMessage += cipher.final("hex");

return encryptedMessage;
}

// Function to handle MongoDB connection
async function connectToMongo() {
    try {
      const client = await MongoClient.connect(mongoUrl);
      const db = client.db("time-series-data");
      const collection = db.collection("objects");
      return collection;
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

// Function to save data to MongoDB
const saveToMongo = async (collection, data) => { 
try {
    // Getting timestamp
    const timestamp = new Date().toString().slice(0,21);
    // Checking if the same time document exists e.g for 14:00 - 14:01
    const document = await collection.findOne({ timestamp: { $eq: timestamp } });
    // Case 1 : document not exists
    if (document == null) {
        // Create a new document
        const document = {
            timestamp: timestamp,
            timeseries: [data]
        };
        // Insert the document into the collection
        await collection.insertOne(document);
    }else {
        // Append the data into document on same timestamp
        document.timeseries.push(data);
        // update the document
        await collection.replaceOne({ timestamp: { $eq: timestamp } }, document);
    }
}catch (error) { 
    console.error("Error saving to MongoDB:", error);
}
}

// Function to decrypt and process a single message
const  processMessage = async (encryptedMessage, encryptionKey,collection) => {
    const decipher = crypto.createDecipheriv(
      "aes-256-ctr",
      Buffer.from(encryptionKey, "hex"),
      Buffer.from("00000000000000000000000000000000", "hex")
    );
  
    let decryptedMessage = decipher.update(encryptedMessage, "hex", "utf-8");
    decryptedMessage += decipher.final("utf-8");
  
    try {
        // decrypt the message
      const message = JSON.parse(decryptedMessage);
  
      // Validate data integrity using the secret_key
      const secret_key = crypto
        .createHash("sha256")
        .update(
          JSON.stringify({
            name: message.name,
            origin: message.origin,
            destination: message.destination,
          })
        )
        .digest("hex");
  
      if (secret_key === message.secret_key) {
        // Data integrity is valid, save to MongoDB
        await saveToMongo(collection, message);
        return message;
      } else {
        console.warn("Data integrity check failed. Message discarded.");
      }
    } catch (error) {
      console.error("Error parsing or processing message:", error);
    }
  }

module.exports = { generateRandomMessage , encryptMessage 
    , connectToMongo , processMessage , saveToMongo}