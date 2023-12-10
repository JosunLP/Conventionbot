import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import ConfigService from "./config.srvs.js";
import Cli from "./cli.srvs.js";
import BuyerService from "./buyer.srvs.js";
import { Buyer } from "../types/buyer.type.js";
import * as fs from "fs";
import * as path from "path";

const __dirname = path.resolve();

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

		this.registerSlahsCommands().catch((err) => {
			console.error(err);
			process.exit(1);
		});

		this.client.on(Events.InteractionCreate, (interaction) => {
			if (!interaction.isCommand()) return;

			//@ts-ignore
			const command = this.client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				command.execute(interaction);
				Cli.log(`Command ${command.data.name} executed`);
			} catch (error) {
				console.error(error);
				interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			}
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

	private async registerSlahsCommands() {
		//@ts-ignore
		this.client.commands = [];
		const config = this.configService.getConfig();

		const foldersPath = path.join(__dirname, "dist/commands");
		const commandFolders = fs.readdirSync(foldersPath);

		for (const folder of commandFolders) {
			const commandFiles = fs
				.readdirSync(`${foldersPath}/${folder}`)
				.filter((file) => file.endsWith(".command.js"));

			for (const file of commandFiles) {
				const command = await import(`../commands/${folder}/${file}`);

				//@ts-ignore
				this.client.commands.push(JSON.stringify(command.data));
			}
		}

		const rest = new REST({ version: "9" }).setToken(
			config.secrets.app_token,
		);

		(async () => {
			try {
				await rest.put(
					Routes.applicationGuildCommands(
						config.secrets.app_id,
						config.server.guild_id,
					),
					//@ts-ignore
					{ body: this.client.commands },
				);
			} catch (error) {
				console.error(error);
			}
		})();
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
