import { Client, GatewayIntentBits } from "discord.js";
import ConfigService from "./config.srvs.js";
import Cli from "../classes/cli.js";
import * as fs from "fs";

export default class DiscordService {
	private static instance: DiscordService;

	private configService = ConfigService.getInstance();
	private client = new Client({ intents: [GatewayIntentBits.Guilds] });

	private constructor() {
		this.connect().catch((err) => {
			console.error(err);
			process.exit(1);
		});
	}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new DiscordService();
		}
		return this.instance;
	}

	public getClient(): Client {
		return this.client;
	}

	private async connect() {
		const config = this.configService.getConfig();
		Cli.log("Connecting to Discord...");
		await this.client.login(config.secrets.app_token);
	}

	public sendMessagesToBuyers() {
		const config = this.configService.getConfig();
		const buyers = JSON.parse(
			fs.readFileSync("./dist/config/buyers.json", "utf8"),
		);

		let message = config.messages.buyer;

		buyers.forEach((buyer: { discord: string; name: string }) => {
			message = message.replaceAll("{{name}}", buyer.name);

			// get the discord user from buyer and send them a message
			const user = this.client.users.createDM(buyer.discord);
			user.then((user) => {
				user.send(message).catch(() => {
					Cli.log(
						`Failed to send message to ${buyer.name} (${buyer.discord})`,
					);
				});
			});
		});
	}
}
