import { ClientEvents, Events } from "discord.js"

export type ApplicationEventExportType = {
	listening: keyof ClientEvents,
	once: boolean,

	onEvent: (...any: any) => Promise<void>;
}