import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env");
}

const client = new MongoClient(process.env.MONGODB_URI);

export default client; 