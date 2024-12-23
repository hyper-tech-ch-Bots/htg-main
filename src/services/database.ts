import { MongoClient, Db } from 'mongodb';

// This is basically the cache
let client: MongoClient | null = null;

/**
 * Connects to the mongodb so other modules can access it too
 * @returns A mongodb Database Connection
 */
export async function connectToDatabase(): Promise<Db> {
	// If the DB is already connected, ignore the connection
	if (client) return getDatabase();

	try {
		console.log("⌛ Preparing database...");
		// Create a new client from the connection string and connect it
		const created_client = new MongoClient(process.env.MONGO_URI);

		console.log("✅ Prepared!");
		console.log("⌛ Connecting database...");
		// Connect to the database with the specified name in the .env
		await created_client.connect();
		client = created_client

		// Log if the connection has worked successfully
		console.log(`✅ MongoDB Client is ready`);

		return getDatabase();
	} catch (error) {
		console.error('❌ Error connecting to MongoDB:', error);

		throw error;
	}
}

/**
 * Gets a database from the mongoDb client.
 * @param dbName Optional: Specific name for the db. Leave empty for project default
 * @returns A mongodb Database Connection
 */
export function getDatabase(dbName?: string): Db {
	if (!client) {
		throw new Error('⚠️ Client not connected. Call connectToDatabase() first.');
	}

	if(dbName) {
		return client.db(dbName);
	} else {
		return client.db(process.env.MONGO_NAME)
	}
}
