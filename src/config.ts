import { GatewayIntentBits } from "discord.js"

export default {
	bot: {
		intents: [
			GatewayIntentBits.Guilds
		]
	}
} satisfies config

//////////////////////////////

type config = {
	bot: {
		intents: GatewayIntentBits[]
	}
}