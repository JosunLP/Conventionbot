/* eslint-disable no-unused-vars */
import {
	ActivityType,
	Client,
	Events,
	GatewayIntentBits,
	GuildMemberRoleManager,
	Interaction,
	REST,
	Routes,
} from "discord.js";
import ConfigService from "./config.srvs.js";
import Cli from "./cli.srvs.js";
import BuyerService from "./buyer.srvs.js";
import * as fs from "fs";
import * as path from "path";
import Buyer from "../models/buyer.model.js";
import UserService from "./user.srvs.js";

const __dirname = path.resolve();

export default class DiscordService {
	private static instance: DiscordService;

	private configService = ConfigService.getInstance();
	private buyerService = BuyerService.getInstance();
	private userService = UserService.getInstance();
	private commandsJson: any[] = [];
	private commands: any[] = [];

	private client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.DirectMessageReactions,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildMessageTyping,
			GatewayIntentBits.DirectMessageTyping,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildInvites,
			GatewayIntentBits.GuildIntegrations,
			GatewayIntentBits.GuildWebhooks,
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

		this.client.on(Events.ClientReady, () => {
			if (this.client.user) {
				this.client.user.setPresence({
					activities: [
						{
							name: "Hyde Bot (ALPHA)",
							type: ActivityType.Custom,
							state: this.configService.getConfig().messages
								.botMode,
						},
					],
					status: "online",
				});
			}
		});

		this.client.on(Events.InteractionCreate, async (interaction) => {
			if (!interaction.isCommand()) return;

			const command = this.commands.find(
				(command) => command.data.name === interaction.commandName,
			);

			if (!command) {
				console.error(
					`No command matching ${interaction.commandName} was found.`,
				);
				return;
			}

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

	/**
	 * Checks permission
	 * @param interaction
	 * @param callback
	 * @param [sudo]
	 * @returns permission
	 * @memberof DiscordService
	 * @description Checks if the user has permission to execute the command or not
	 */
	public async checkPermission(
		interaction: Interaction,
		callback: (interaction: Interaction) => void,
		sudo: boolean = false,
	): Promise<void> {
		const userId = interaction.user.id;
		const groupId = interaction.guild
			? interaction.member?.roles instanceof GuildMemberRoleManager
				? interaction.member.roles.cache.map((role) => role.id)
				: []
			: [];
		const ServerSettings = this.configService.getConfig().server;
		const databaseUserList = await this.userService.getUsers();
		let databaseAdminUsers = [];

		switch (sudo) {
			case true:
				databaseAdminUsers = await this.userService.getAdminUsers();
				if (
					!ServerSettings.authorized_users.includes(userId) &&
					!databaseAdminUsers.some(
						(user) => user.discordId === userId,
					)
				) {
					callback(interaction);
				}

				break;

			case false:
				if (
					!ServerSettings.authorized_users.includes(userId) &&
					!groupId.some((id) =>
						ServerSettings.authorized_roles.includes(id),
					) &&
					!databaseUserList.some((user) => user.discordId === userId)
				) {
					callback(interaction);
				}
				break;

			default:
				if (
					!ServerSettings.authorized_users.includes(userId) &&
					!groupId.some((id) =>
						ServerSettings.authorized_roles.includes(id),
					) &&
					!databaseUserList.some((user) => user.discordId === userId)
				) {
					callback(interaction);
				}
				break;
		}
	}

	private async connect() {
		const config = this.configService.getConfig();
		Cli.log("Connecting to Discord...");
		await this.client.login(config.secrets.app_token).then(() => {
			Cli.log("Connected to Discord!");
		});
	}

	private async registerSlahsCommands() {
		const config = this.configService.getConfig();
		this.commands = [];
		this.commandsJson = [];

		const foldersPath = path.join(__dirname, "dist/commands");
		const commandFolders = fs.readdirSync(foldersPath);

		for (const folder of commandFolders) {
			const path = `${foldersPath}/${folder}`;

			if (!fs.lstatSync(path).isFile()) {
				const commandFiles = fs
					.readdirSync(`${foldersPath}/${folder}`)
					.filter((file) => file.endsWith(".command.js"));

				for (const file of commandFiles) {
					const command = await import(
						`../commands/${folder}/${file}`
					);

					this.commandsJson.push(command.default.data.toJSON());
					this.commands.push(command.default);
				}
			} else {
				const command = await import(`../commands/${folder}`);

				this.commandsJson.push(command.default.data.toJSON());
				this.commands.push(command.default);
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
					{ body: this.commandsJson },
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
