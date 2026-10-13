import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

if (!dbName) {
  throw new Error("MONGODB_DB_NAME environment variable is not set");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    // Don't keep a failed first connection for the life of the server: the
    // next request tries again.
    client = new MongoClient(uri!);
    clientPromise = client.connect();
    // Awaited by the next request; this only stops an "unhandled rejection".
    clientPromise.catch(() => {});
    if (process.env.NODE_ENV === "development") {
      globalWithMongo._mongoClientPromise = clientPromise;
    }
    throw error;
  }
}

export default clientPromise;
