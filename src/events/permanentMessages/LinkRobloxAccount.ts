import { BaseMessageOptions, Client, Events } from "discord.js";
import { getDatabase } from "services/database";
import { ApplicationEventExportType } from "types/exports/events";

export default {
	listening: Events.ClientReady,
	once: false,

	onEvent: async (client: Client) => {
		const internalMessageId = "roblox_account_link"
		const messageChannelId  = "1320157046213050432"
		const messageContent: BaseMessageOptions = {
			content: "Hi"
		}

		/////////////////////////////////////////////////////////

		let collection = getDatabase().collection("PermanentMessages")

		/////////////////////////////////////////////////////////

		async function doesMessageExist(): Promise<boolean> {
			

			return true
		}
	}
} satisfies ApplicationEventExportType