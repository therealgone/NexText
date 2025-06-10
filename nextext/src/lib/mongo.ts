import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env");
}

const uri = process.env.MONGODB_URI;

const options: MongoClientOptions = {
  useUnifiedTopology: true,
  maxPoolSize: 50, // Increased pool size for multiple connections
  minPoolSize: 10, // Maintain minimum connections
  maxIdleTimeMS: 60000, // Close idle connections after 1 minute
  connectTimeoutMS: 30000, // Increased connection timeout
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000, // Increased server selection timeout
  retryWrites: true,
  retryReads: true,
  w: "majority", // Write concern
  readPreference: "primaryPreferred", // Read from primary if available, otherwise secondary
  heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error("Failed to connect to MongoDB:", err);
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 