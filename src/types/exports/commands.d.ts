import { SlashCommandBuilder } from "discord.js";

export type ApplicationCommandExportType = {
	data: SlashCommandBuilder;
	rateLimit: {
		MaxExecutions: number;
		Cooldown: number;
		GiveWarningForRatelimit?: boolean
	};

	onExecute: (interaction: CommandInteraction) => Promise<void>;
};