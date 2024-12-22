import { Guild, User } from "discord.js"

export type CommandExecutionDocument = {
	userId: string,
	guildId: string | undefined,

	executedAt: Date,

	commandName: string,
}