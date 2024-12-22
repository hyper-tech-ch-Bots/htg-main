declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_TOKEN: string;
			DISCORD_APPID: string;

			MONGO_URI: string;
			MONGO_NAME: string;
		}
	}
}

export {};