import { Client, Events } from "discord.js";
import { ApplicationEventExportType } from "src/types/exports/events";

export default {
	listening: Events.ClientReady,
	once: false,

	onEvent: async (client: Client) => {
		console.log("😲 ClientReady Event works!");
	}
} satisfies ApplicationEventExportType