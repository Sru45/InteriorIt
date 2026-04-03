import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log("Starting DB Connection test...");
console.log("URI:", process.env.MONGO_URI ? "Loaded (hidden for security)" : "Missing");

mongoose.connect(process.env.MONGO_URI, { 
  serverSelectionTimeoutMS: 15000,
  family: 4 // Force IPv4
})
  .then(() => {
    console.log("SUCCESSFULLY CONNECTED TO MONGODB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILED TO CONNECT:");
    console.error(err);
    if (err.reason) {
      console.error("Reason:", err.reason);
    }
    process.exit(1);
  });
