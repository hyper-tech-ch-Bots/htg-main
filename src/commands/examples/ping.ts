import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ApplicationCommandExportType } from "src/types/exports/commands";

export default {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong"),

	rateLimit: {
		MaxExecutions: 3,
		Cooldown: 60,
		GiveWarningForRatelimit: true,
	},

	onExecute: async (interaction: CommandInteraction) => {
		await interaction.reply("Pong!");
	}
} satisfies ApplicationCommandExportType