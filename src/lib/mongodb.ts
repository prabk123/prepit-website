import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

if (!dbName) {
  throw new Error("MONGODB_DB_NAME environment variable is not set");
}

// Fail in seconds rather than the driver's 30 s default, so an outage shows
// the error page quickly instead of hanging every request.
const CLIENT_OPTIONS = { serverSelectionTimeoutMS: 5000 };

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

function connect() {
  client = new MongoClient(uri!, CLIENT_OPTIONS);
  clientPromise = client.connect();
  // Awaited by getDatabase; this only stops an "unhandled rejection".
  clientPromise.catch(() => {});
  if (process.env.NODE_ENV === "development") {
    globalWithMongo._mongoClient = client;
    globalWithMongo._mongoClientPromise = clientPromise;
  }
}

if (process.env.NODE_ENV === "development" && globalWithMongo._mongoClientPromise) {
  client = globalWithMongo._mongoClient!;
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  connect();
}

export async function getDatabase(): Promise<Db> {
  const attempt = clientPromise;
  try {
    return (await attempt).db(dbName);
  } catch (error) {
    // Don't keep a failed connection for the life of the server. Only the
    // first request to see this failure starts a new client, so a burst of
    // failing requests doesn't open a pool each; the failed one is closed.
    if (clientPromise === attempt) {
      const failed = client;
      failed.close().catch(() => {});
      connect();
    }
    throw error;
  }
}
