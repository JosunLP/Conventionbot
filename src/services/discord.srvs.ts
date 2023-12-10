import { Client, GatewayIntentBits } from "discord.js";
import ConfigService from "./config.srvs.js";
import Cli from "./cli.srvs.js";
import BuyerService from "./buyer.srvs.js";
import { Buyer } from "../types/buyer.type.js";

export default class DiscordService {
	private static instance: DiscordService;

	private configService = ConfigService.getInstance();
	private buyerService = BuyerService.getInstance();

	private client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.DirectMessageReactions,
		],
	});

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
		const buyers = this.buyerService.getBuyers();

		let message = config.messages.buyer;

		buyers.forEach((buyer: Buyer) => {
			message = message.replaceAll("{{name}}", buyer.name);

			this.client.guilds.fetch().then((guilds) => {
				guilds.forEach((guild) => {
					guild.fetch().then((guild) => {
						guild.members.fetch().then((members) => {
							members.forEach((member) => {
								if (member.user.tag === buyer.discord) {
									member.send(message);
								}
							});
						});
					});
				});
			});
		});
	}
}
