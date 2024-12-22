import { Client, ClientApplication, Events } from "discord.js";
import dotenv from 'dotenv';
import { connectToDatabase } from "./services/database";

// This creates the env from the .env file
dotenv.config();

/**
 * Main function that creates the bot. This is needed because
 * this setup uses async functions.
 */
async function main() {
	// Database Setup
	await connectToDatabase();

	// First thing we do, is create the Discord Bot
	console.log("⌛ Creating Discord Bot...");

	const client = new Client({
		intents: []
	})

	client.login(process.env.DISCORD_TOKEN)
	client.once(Events.ClientReady, readyClient => {
		console.log(`✅ Bot Ready! Logged in as ${readyClient.user.tag}`);
	});

	//////////////////////////////////////////////////////////////////////////

	// Graceful shutdown handling
	process.on('SIGINT', async () => {
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		process.exit(0);
	});
}

main()