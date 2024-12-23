import { applicationDirectory, Client, ClientApplication, Events, REST, RESTPostAPIApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from 'dotenv';
import { connectToDatabase, getDatabase } from "./services/database";
import { readDirRecursive } from "./helpers/readDirRecursive";
import path from "path";
import { ApplicationCommandExportType } from "./types/exports/commands";
import { CommandExecutionDocument } from "./types/db/CommandExecutionDocument";
import { ApplicationEventExportType } from "./types/exports/events";

/**
 * 
 *             W A R N I N G
 * 
 *  YOU SHOULD NOT BE CHANGING CODE IN HERE!
 *  IF YOU DO SO, GETTING UPGRADES MAY GET
 *  WAY HARDER. IF YOU DON'T EDIT THIS, YOU
 *  CAN SIMPLY MERGE THE TEMPLATE TO THIS
 *                  PROJECT
 * 
 *  This is V.1.0.1 of this template
 */


// This creates the env from the .env file
dotenv.config();

/**
 * Main function that creates the bot. This is needed because
 * this setup uses async functions.
 */
async function main() {
	let commandsToRegister = []
	let eventsToRegister = []

	// Database Setup
	await connectToDatabase();
	let commandExecutionLogCollection = getDatabase().collection("command_executions")

	const client = new Client({
		intents: []
	})

	//////////////////////////////////////////////////////////////////////////
	// Gather all command files and parse them

	console.log("⌛ Gathering all (/) Commands");

	try {
		const files: string[] = await readDirRecursive('./dist/commands');

		for (const filePath of files) {
			console.log("   🔗 " + filePath);

			// Parse the file
			const absolutePath = path.resolve(process.cwd(), filePath);
			const routeModule = await import(absolutePath);

			if (path.dirname(absolutePath).endsWith("examples")) continue;

			// Add the command to the commands to add if it is a real file
			if (routeModule.default && typeof routeModule.default === 'object') {
				commandsToRegister.push(routeModule.default as ApplicationCommandExportType);
			}
		}
	} catch (error) {
		console.error('🛑 Error reading directory:', error);
		process.exit(1);
	}

	console.log("✅ Commands directory parsed!");
	
	
	//////////////////////////////////////////////////////////////////////////
	// Gather event files and parse them

	console.log("⌛ Gathering all application events");

	try {
		const files: string[] = await readDirRecursive('./dist/events');

		for (const filePath of files) {
			console.log("   🔗 " + filePath);

			// Parse the file
			const absolutePath = path.resolve(process.cwd(), filePath);
			const routeModule = await import(absolutePath);

			if (path.dirname(absolutePath).endsWith("examples")) continue;

			// Add the command to the commands to add if it is a real file
			if (routeModule.default && typeof routeModule.default === 'object') {
				eventsToRegister.push(routeModule.default as ApplicationEventExportType);
			}
		}
	} catch (error) {
		console.error('🛑 Error reading directory:', error);
		process.exit(1);
	}

	//////////////////////////////////////////////////////////////////////////
	// Register all application events
	console.log(`⌛ Started refreshing ${eventsToRegister.length} application events.`);

	eventsToRegister.forEach(event => {
		if (!event.listening) return;

		if(event.once) {
			client.once(event.listening, event.onEvent);
		} else {
			client.on(event.listening, event.onEvent);
		}
	})

	console.log("✅ Application events linked");
	
	//////////////////////////////////////////////////////////////////////////
	// Register (/) Commands
	const rest = new REST().setToken(process.env.DISCORD_TOKEN);

	(async () => {
		try {
			console.log(`⌛ Started refreshing ${commandsToRegister.length} application (/) commands.`);

			// Get only the bare command builder
			let discordReadableCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

			// Convert each command to JSON and push to the array
			commandsToRegister.forEach(item => {
				const jsonData = item.data.toJSON();

				discordReadableCommands.push(jsonData);
			});

			// The put method is used to fully refresh all commands in the guild with the current set
			const data = await rest.put(
				Routes.applicationCommands(process.env.DISCORD_APPID),
				{ body: discordReadableCommands },
			);

			console.log(`✅ Successfully reloaded ${commandsToRegister.length} application (/) commands.`);
		} catch (error) {
			// And of course, make sure you catch and log any errors!
			console.error(error);
		}
	})();

	//////////////////////////////////////////////////////////////////////////
	// Create the Discord Bot Client
	console.log("⌛ Creating Discord Bot...");

	//////////////////////////////////////////////////////////////////////////
	// Handle (/) Commands
	client.on(Events.InteractionCreate, async interaction => {
		if (!interaction.isChatInputCommand()) return;

		const command = commandsToRegister.find(t => t.data.name === interaction.commandName);

		// See, if the command even exists (it will 99.9999999999% the time)
		// If it doesn't exist, Discord was just slow or something
		if (!command) {
			console.error(`❌ No command matching ${interaction.commandName} was found.`);
			interaction.reply("This command was not found. Please try again in 5 minutes.")
			return;
		}

		// This is the rate limit manager
		let commandExecutionsInTimeframe = await commandExecutionLogCollection.find({
			executedAt: { $gt: new Date( Date.now() - command.rateLimit.Cooldown * 1000) }
		})
		.sort({ executedAt: 1 }) // Start with the oldest execution
		.toArray();
		
		if( commandExecutionsInTimeframe.length + 1 > command.rateLimit.MaxExecutions ) {
			let oldestExecution = commandExecutionsInTimeframe[0]
			let canExecuteAgainAt = Math.floor((oldestExecution.executedAt.getTime() + command.rateLimit.Cooldown * 1000) / 1000);

			interaction.reply({
				ephemeral: true,
				content: `You've been ratelimited! You can only execute this command ${command.rateLimit.MaxExecutions}x every ${command.rateLimit.Cooldown} seconds.\nYou can execute commands again <t:${canExecuteAgainAt}:R>`
			})

			return;
		}

		// Run the command! 🚀
		try {
			await command.onExecute(interaction);
		} catch (executionError) {
			console.error(`Error executing ${interaction.commandName}:`, executionError);
			// Reply with an error message if not already replied or deferred
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}

		// If GiveWarningForRatelimit is true, reply with a warning
		if (command.rateLimit.GiveWarningForRatelimit) {
			let commandsLeft = command.rateLimit.MaxExecutions - commandExecutionsInTimeframe.length - 1
			let text = `Caution: this command has a ratelimit. You can execute this command ${command.rateLimit.MaxExecutions}x every ${command.rateLimit.Cooldown} seconds.
After that, you will have to wait until your rate limit is lifted.

You can execute ${commandsLeft} more command(s) before you will be ratelimited.`

			if (interaction.replied || interaction.deferred) {
				interaction.followUp({
					ephemeral: true,
					content: text,
				})
			} else {
				interaction.reply({
					ephemeral: true,
					content: text,
				})
			}
		}

		// Log the execution in the database, also for rate limits
		commandExecutionLogCollection.insertOne({
			userId: interaction.user.id,
			guildId: interaction.guild?.id,

			executedAt: new Date(),

			commandName: interaction.commandName
		} satisfies CommandExecutionDocument)
	})

	//////////////////////////////////////////////////////////////////////////
	// Log in to the bot

	client.login(process.env.DISCORD_TOKEN)
	client.once(Events.ClientReady, readyClient => {
		console.log(`✅ Bot Ready! Logged in as ${readyClient.user.tag}`);
	});

	//////////////////////////////////////////////////////////////////////////
	// Shutdown Procedure

	// Graceful shutdown handling
	process.on('SIGINT', async () => {
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		process.exit(0);
	});
}

main()