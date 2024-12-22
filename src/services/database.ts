import { MongoClient, Db } from 'mongodb';

// This is basically the cache
let db: Db | null = null;

/**
 * Connects to the mongodb so other programs can access it
 * @returns A mongodb Database Connection
 */
export async function connectToDatabase(): Promise<Db> {
	// If the DB is already connected, ignore the connection
	if (db) return db;

	try {
		console.log("⌛ Preparing database...");
		// Create a new client from the connection string and connect it
		const client = new MongoClient(process.env.MONGO_URI);

		console.log("✅ Prepared!");
		console.log("⌛ Connecting database...");
		// Connect to the database with the specified name in the .env
		await client.connect();
		db = client.db(process.env.MONGO_NAME);

		// Log if the connection has worked successfully
		console.log(`✅ Connected to database: ${db.databaseName}`);

		return db;
	} catch (error) {
		console.error('❌ Error connecting to MongoDB:', error);

		throw error;
	}
}

export function getDatabase(): Db {
	if (!db) {
		throw new Error('⚠️ Database not connected. Call connectToDatabase() first.');
	}

	return db;
}
